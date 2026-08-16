/**
 * TTS SERVICE (TEXT-TO-SPEECH SERVICE)
 * Chuyên trách Giọng Đọc Nữ Tiếng Việt Chuẩn Sư Phạm cho toàn bộ hệ thống Web Vui Học:
 * 1. 🔍 Tự động phát hiện và chọn giọng Nữ Tiếng Việt (Microsoft HoaiMy, Google Tiếng Việt, Mai, Linh...)
 * 2. 🌐 Cơ chế Fallback thông minh: Nếu máy tính chưa cài gói giọng Tiếng Việt, tự động sử dụng luồng âm thanh Nữ Tiếng Việt HD (Google TTS Audio Stream) 100% tiếng Việt ngọt ngào.
 * 3. ✂️ Tự động ngắt đoạn câu dài (chunking) để đọc trơn tru, không bao giờ bị ngắt quãng.
 * 4. 🎛️ Tinh chỉnh cao độ (Pitch: 1.2) và tốc độ (Rate: 0.92) chuẩn giọng Cô giáo tiểu học.
 */

class TTSService {
  constructor() {
    this.speechSynth = window.speechSynthesis || null;
    this.voices = [];
    this.vietnameseVoice = null;
    this.isAudioPlaying = false;
    this.currentAudio = null;
    this.audioQueue = [];
    this.isSpeakingState = false;

    this.initVoices();
    if (this.speechSynth && this.speechSynth.onvoiceschanged !== undefined) {
      this.speechSynth.onvoiceschanged = () => this.initVoices();
    }
  }

  initVoices() {
    if (!this.speechSynth) return;
    this.voices = this.speechSynth.getVoices();
    if (!this.voices || this.voices.length === 0) return;

    // 1. Tìm các giọng Tiếng Việt
    const viVoices = this.voices.filter(v => v.lang && (v.lang.toLowerCase().includes("vi") || v.lang.toLowerCase().includes("viet")));

    // 2. Ưu tiên cao nhất: Giọng Nữ Tiếng Việt (HoaiMy Natural, Google Tiếng Việt, Mai, Linh, An...)
    const femaleVi = viVoices.find(v => {
      const name = v.name.toLowerCase();
      return name.includes("hoaimy") || name.includes("hoài my") || name.includes("google tiếng việt") || 
             name.includes("linh") || name.includes("mai") || name.includes("female") || 
             name.includes("nu") || name.includes("nữ") || name.includes("an");
    });

    if (femaleVi) {
      this.vietnameseVoice = femaleVi;
    } else if (viVoices.length > 0) {
      this.vietnameseVoice = viVoices[0];
    } else {
      this.vietnameseVoice = null; // Sẽ dùng Audio Fallback chuẩn 100% Nữ Tiếng Việt
    }
  }

  getBestVoice() {
    if (!this.vietnameseVoice) {
      this.initVoices();
    }
    return this.vietnameseVoice;
  }

  /**
   * Đọc văn bản bằng giọng Nữ Tiếng Việt
   * @param {string} text - Văn bản cần đọc
   * @param {object} options - { onStart, onEnd, rate, pitch }
   */
  speak(text, options = {}) {
    if (!text || !text.trim()) return;
    this.stop(); // Dừng câu đọc trước

    const cleanText = this.cleanTextForSpeech(text);
    const onStart = options.onStart || (() => {});
    const onEnd = options.onEnd || (() => {});
    const rate = options.rate || 0.92;
    const pitch = options.pitch || 1.2; // Giọng thanh cao, trong sáng, ấm áp chuẩn Cô giáo

    const viVoice = this.getBestVoice();

    // NẾU CÓ GIỌNG TIẾNG VIỆT CỦA HỆ THỐNG / TRÌNH DUYỆT (Google Tiếng Việt / HoaiMy...)
    if (this.speechSynth && viVoice) {
      try {
        this.isSpeakingState = true;
        onStart();

        // Cắt văn bản thành các câu vừa phải để đọc tự nhiên
        const chunks = this.splitTextIntoChunks(cleanText, 160);
        let currentChunkIndex = 0;

        const speakNextChunk = () => {
          if (!this.isSpeakingState || currentChunkIndex >= chunks.length) {
            this.isSpeakingState = false;
            onEnd();
            return;
          }

          const chunkText = chunks[currentChunkIndex];
          currentChunkIndex++;

          const utterance = new SpeechSynthesisUtterance(chunkText);
          utterance.voice = viVoice;
          utterance.lang = "vi-VN";
          utterance.rate = rate;
          utterance.pitch = pitch;

          utterance.onend = () => {
            if (currentChunkIndex < chunks.length && this.isSpeakingState) {
              setTimeout(speakNextChunk, 80);
            } else {
              this.isSpeakingState = false;
              onEnd();
            }
          };

          utterance.onerror = (e) => {
            console.warn("SpeechSynthesis error, switching to Audio stream fallback:", e);
            this.speakViaAudioStream(cleanText, { onStart, onEnd });
          };

          this.speechSynth.speak(utterance);
        };

        speakNextChunk();
        return;
      } catch (err) {
        console.warn("SpeechSynthesis exception:", err);
      }
    }

    // FALLBACK 100% NỮ TIẾNG VIỆT: Sử dụng luồng Audio HD
    this.speakViaAudioStream(cleanText, { onStart, onEnd });
  }

  /**
   * Phát giọng Nữ Tiếng Việt qua luồng Audio stream (Bảo đảm 100% tiếng Việt chuẩn ngọt ngào)
   */
  speakViaAudioStream(text, { onStart, onEnd }) {
    this.stop();
    this.isSpeakingState = true;
    if (onStart) onStart();

    const chunks = this.splitTextIntoChunks(text, 140);
    this.audioQueue = [...chunks];

    const playNext = () => {
      if (!this.isSpeakingState || this.audioQueue.length === 0) {
        this.isSpeakingState = false;
        if (onEnd) onEnd();
        return;
      }

      const chunk = this.audioQueue.shift();
      const encoded = encodeURIComponent(chunk);
      const url = `https://translate.google.com/translate_tts?ie=UTF-8&tl=vi&client=tw-ob&q=${encoded}`;

      const audio = new Audio(url);
      this.currentAudio = audio;
      this.isAudioPlaying = true;

      audio.onended = () => {
        if (this.isSpeakingState && this.audioQueue.length > 0) {
          setTimeout(playNext, 100);
        } else {
          this.isSpeakingState = false;
          this.isAudioPlaying = false;
          if (onEnd) onEnd();
        }
      };

      audio.onerror = () => {
        console.warn("Audio fallback failed for chunk, moving next");
        if (this.isSpeakingState && this.audioQueue.length > 0) {
          playNext();
        } else {
          this.isSpeakingState = false;
          if (onEnd) onEnd();
        }
      };

      audio.play().catch(e => {
        console.warn("Audio play prevented:", e);
        this.isSpeakingState = false;
        if (onEnd) onEnd();
      });
    };

    playNext();
  }

  stop() {
    this.isSpeakingState = false;
    this.audioQueue = [];

    if (this.speechSynth) {
      try {
        this.speechSynth.cancel();
      } catch (e) {}
    }

    if (this.currentAudio) {
      try {
        this.currentAudio.pause();
        this.currentAudio.currentTime = 0;
      } catch (e) {}
      this.currentAudio = null;
    }
    this.isAudioPlaying = false;
  }

  isSpeaking() {
    return this.isSpeakingState;
  }

  /**
   * Làm sạch văn bản trước khi đọc (loại bỏ HTML tags, ký tự lạ)
   */
  cleanTextForSpeech(htmlOrText) {
    if (!htmlOrText) return "";
    const tmp = document.createElement("div");
    tmp.innerHTML = htmlOrText;
    let clean = tmp.textContent || tmp.innerText || "";
    // Thay thế ký hiệu đặc biệt
    clean = clean.replace(/([0-9]+)P/gi, "$1 phút");
    clean = clean.replace(/([0-9]+)s/gi, "$1 giây");
    clean = clean.replace(/\+/g, "cộng ");
    clean = clean.replace(/➔/g, ", sau đó ");
    clean = clean.replace(/★|⭐|🏆|👑|🔔|🐱|🎈|🃏|⚡|🧩|🎡/g, "");
    clean = clean.replace(/\s+/g, " ").trim();
    return clean;
  }

  /**
   * Tách câu dài thành các câu nhỏ tự nhiên
   */
  splitTextIntoChunks(text, maxLength = 150) {
    if (text.length <= maxLength) return [text];

    const sentences = text.split(/(?<=[.?!,;:\n])\s+/);
    const chunks = [];
    let currentChunk = "";

    for (const s of sentences) {
      if ((currentChunk + " " + s).trim().length <= maxLength) {
        currentChunk = (currentChunk + " " + s).trim();
      } else {
        if (currentChunk) chunks.push(currentChunk);
        currentChunk = s;
      }
    }
    if (currentChunk) chunks.push(currentChunk);
    return chunks.length > 0 ? chunks : [text.substring(0, maxLength)];
  }

  /**
   * Nghe thử giọng đọc Nữ Cô Giáo mẫu
   */
  testTeacherVoice() {
    const sample = "Xin chào các em học sinh thân yêu! Cô là Cô Giáo Anh Đào. Hôm nay chúng mình cùng học môn Tin học thật vui và bổ ích nhé!";
    window.app?.showToast?.("🔊 Đang phát giọng đọc mẫu Nữ Tiếng Việt của Cô Giáo...", "info");
    this.speak(sample, {
      onEnd: () => {
        window.app?.showToast?.("🎉 Đã hoàn thành phát giọng đọc mẫu!", "success");
      }
    });
  }
}

window.ttsService = new TTSService();
