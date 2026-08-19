/**
 * TTS SERVICE (TEXT-TO-SPEECH & KARAOKE ENGINE)
 * Chuyên trách Giọng Đọc Nữ Tiếng Việt Chuẩn Sư Phạm & Bôi Màu Từ Khóa Thời Gian Thực (Karaoke Word Highlighting):
 * 1. 🔍 Tự động phát hiện và chọn giọng Nữ Tiếng Việt (Microsoft HoaiMy, Google Tiếng Việt, Mai, Linh...)
 * 2. ✨ Karaoke Word Highlighting: Bôi màu dạ quang từng từ theo nhịp đọc của Cô giáo.
 * 3. 🌐 Cơ chế Fallback thông minh: Nếu máy tính chưa cài gói giọng Tiếng Việt, tự động sử dụng luồng âm thanh Nữ Tiếng Việt HD (Google TTS Audio Stream) 100% tiếng Việt ngọt ngào.
 * 4. ✂️ Tự động ngắt đoạn câu dài (chunking) để đọc trơn tru, không bao giờ bị ngắt quãng.
 * 5. 🎛️ Tinh chỉnh cao độ (Pitch: 1.2) và tốc độ (Rate: 0.92) chuẩn giọng Cô giáo tiểu học.
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
    this.isKaraokeEnabled = true;
    this.activeKaraokeElements = [];
    this.karaokeTimer = null;

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
      this.vietnameseVoice = null;
    }
  }

  getBestVoice() {
    if (!this.vietnameseVoice) {
      this.initVoices();
    }
    return this.vietnameseVoice;
  }

  /**
   * Bật/Tắt chế độ bôi màu Karaoke
   */
  toggleKaraoke() {
    this.isKaraokeEnabled = !this.isKaraokeEnabled;
    window.app?.showToast?.(this.isKaraokeEnabled ? "✨ Đã BẬT hiệu ứng bôi chữ Karaoke theo giọng Cô!" : "Đã TẮT hiệu ứng bôi chữ Karaoke!", "info");
    return this.isKaraokeEnabled;
  }

  /**
   * Chuẩn bị các từ trong phần tử HTML để bôi màu Karaoke
   * @param {HTMLElement|string} container - Phần tử hoặc id phần tử
   */
  prepareKaraokeElements(container) {
    const el = typeof container === 'string' ? document.getElementById(container) : container;
    if (!el) return [];

    // Tìm tất cả các đoạn văn, tiêu đề, danh sách
    const textNodes = [];
    const walk = document.createTreeWalker(el, NodeFilter.SHOW_TEXT, null, false);
    let n;
    while (n = walk.nextNode()) {
      if (n.nodeValue && n.nodeValue.trim().length > 0 && n.parentElement && !n.parentElement.classList.contains("karaoke-ignore")) {
        textNodes.push(n);
      }
    }

    let wordCounter = 0;
    const wordSpans = [];

    textNodes.forEach(node => {
      const text = node.nodeValue;
      const words = text.split(/(\s+)/);
      const spanWrapper = document.createElement("span");

      words.forEach(w => {
        if (/^\s+$/.test(w) || w === "") {
          spanWrapper.appendChild(document.createTextNode(w));
        } else {
          const wSpan = document.createElement("span");
          wSpan.className = "karaoke-word transition-all duration-150 rounded px-0.5";
          wSpan.dataset.wordIndex = wordCounter;
          wSpan.innerText = w;
          spanWrapper.appendChild(wSpan);
          wordSpans.push(wSpan);
          wordCounter++;
        }
      });

      if (node.parentNode) {
        node.parentNode.replaceChild(spanWrapper, node);
      }
    });

    this.activeKaraokeElements = wordSpans;
    return wordSpans;
  }

  /**
   * Làm nổi bật từ thứ index
   */
  highlightWordIndex(index) {
    if (!this.isKaraokeEnabled || !this.activeKaraokeElements) return;

    this.activeKaraokeElements.forEach((wSpan, idx) => {
      if (idx === index) {
        wSpan.className = "karaoke-word bg-amber-400 text-slate-950 font-black rounded px-1 shadow-[0_0_12px_rgba(251,191,36,0.9)] scale-110 transition-all duration-150 inline-block ring-2 ring-yellow-300";
      } else if (idx < index) {
        wSpan.className = "karaoke-word text-amber-500 font-bold px-0.5 opacity-90 transition-all";
      } else {
        wSpan.className = "karaoke-word transition-all duration-150 px-0.5";
      }
    });
  }

  clearKaraokeHighlight() {
    if (this.karaokeTimer) {
      clearInterval(this.karaokeTimer);
      this.karaokeTimer = null;
    }
    if (this.activeKaraokeElements && this.activeKaraokeElements.length > 0) {
      this.activeKaraokeElements.forEach(wSpan => {
        wSpan.className = "karaoke-word transition-all duration-150 px-0.5";
      });
    }
    this.activeKaraokeElements = [];
  }

  /**
   * Đọc văn bản bằng giọng Nữ Tiếng Việt kèm hiệu ứng Karaoke
   * @param {string} text - Văn bản cần đọc
   * @param {object} options - { onStart, onEnd, rate, pitch, karaokeContainers }
   */
  speak(text, options = {}) {
    if (!text || !text.trim()) return;
    this.stop();

    const cleanText = this.cleanTextForSpeech(text);
    const onStart = options.onStart || (() => {});
    const onEnd = options.onEnd || (() => {});
    const rate = options.rate || 0.92;
    const pitch = options.pitch || 1.2;

    // Chuẩn bị Karaoke nếu có containers
    if (options.karaokeContainers && this.isKaraokeEnabled) {
      this.activeKaraokeElements = [];
      options.karaokeContainers.forEach(c => {
        const spans = this.prepareKaraokeElements(c);
        this.activeKaraokeElements.push(...spans);
      });
    }

    const viVoice = this.getBestVoice();

    // 1. NẾU DÙNG SPEECH SYNTHESIS CỦA TRÌNH DUYỆT
    if (this.speechSynth && viVoice) {
      try {
        this.isSpeakingState = true;
        onStart();

        const chunks = this.splitTextIntoChunks(cleanText, 160);
        let currentChunkIndex = 0;
        let globalWordOffset = 0;

        const speakNextChunk = () => {
          if (!this.isSpeakingState || currentChunkIndex >= chunks.length) {
            this.isSpeakingState = false;
            this.clearKaraokeHighlight();
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

          // Bắt sự kiện đọc từng từ của SpeechSynthesis
          let chunkWordIdx = 0;
          utterance.onboundary = (event) => {
            if (event.name === 'word' || event.charIndex !== undefined) {
              const currentTotalWord = globalWordOffset + chunkWordIdx;
              this.highlightWordIndex(currentTotalWord);
              chunkWordIdx++;
            }
          };

          utterance.onend = () => {
            const wordsInChunk = chunkText.trim().split(/\s+/).length;
            globalWordOffset += wordsInChunk;

            if (currentChunkIndex < chunks.length && this.isSpeakingState) {
              setTimeout(speakNextChunk, 80);
            } else {
              this.isSpeakingState = false;
              this.clearKaraokeHighlight();
              onEnd();
            }
          };

          utterance.onerror = (e) => {
            console.warn("SpeechSynthesis error, falling back to Audio stream:", e);
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

    // 2. FALLBACK 100% NỮ TIẾNG VIỆT QUA LUỒNG AUDIO STREAM HD
    this.speakViaAudioStream(cleanText, { onStart, onEnd });
  }

  /**
   * Phát giọng Nữ Tiếng Việt qua luồng Audio stream kèm mô phỏng Karaoke
   */
  speakViaAudioStream(text, { onStart, onEnd }) {
    this.stop();
    this.isSpeakingState = true;
    if (onStart) onStart();

    const chunks = this.splitTextIntoChunks(text, 140);
    this.audioQueue = [...chunks];

    // Mô phỏng nhịp đọc Karaoke theo tốc độ từ (trung bình ~230ms một âm tiết)
    if (this.isKaraokeEnabled && this.activeKaraokeElements.length > 0) {
      let curWord = 0;
      const totalWords = this.activeKaraokeElements.length;
      if (this.karaokeTimer) clearInterval(this.karaokeTimer);

      this.karaokeTimer = setInterval(() => {
        if (!this.isSpeakingState || curWord >= totalWords) {
          clearInterval(this.karaokeTimer);
          return;
        }
        this.highlightWordIndex(curWord);
        curWord++;
      }, 240);
    }

    const playNext = () => {
      if (!this.isSpeakingState || this.audioQueue.length === 0) {
        this.isSpeakingState = false;
        this.clearKaraokeHighlight();
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
          this.clearKaraokeHighlight();
          if (onEnd) onEnd();
        }
      };

      audio.onerror = () => {
        if (this.isSpeakingState && this.audioQueue.length > 0) {
          playNext();
        } else {
          this.isSpeakingState = false;
          this.clearKaraokeHighlight();
          if (onEnd) onEnd();
        }
      };

      audio.play().catch(e => {
        console.warn("Audio play prevented:", e);
        this.isSpeakingState = false;
        this.clearKaraokeHighlight();
        if (onEnd) onEnd();
      });
    };

    playNext();
  }

  stop() {
    this.isSpeakingState = false;
    this.audioQueue = [];
    this.clearKaraokeHighlight();

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
   * Làm sạch văn bản trước khi đọc
   */
  cleanTextForSpeech(htmlOrText) {
    if (!htmlOrText) return "";
    const tmp = document.createElement("div");
    tmp.innerHTML = htmlOrText;
    let clean = tmp.textContent || tmp.innerText || "";
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

  // =========================================================================
  // BỘ ÂM THANH KHEN THƯỞNG & CỔ VŨ THEO GIỌNG CÔ GIÁO (VOICE PRAISE CLIPS)
  // =========================================================================
  getPraiseClips() {
    return {
      excellent: [
        "Xuất sắc lắm em ơi! Câu trả lời hoàn toàn chính xác!",
        "Tuyệt vời! Cô thưởng cho em mười điểm và mười lăm sao vàng nhé!",
        "Hoan hô! Em làm bài rất giỏi và hiểu bài rất sâu sắc!"
      ],
      cheer: [
        "Hoan hô bạn đã trả lời rất nhanh và chính xác!",
        "Cả lớp hãy cùng vỗ tay khen ngợi bạn nào!",
        "Rất chuẩn xác! Em nắm kiến thức bài học rất vững vàng!"
      ],
      smart: [
        "Câu trả lời rất thông minh và đầy tính sáng tạo!",
        "Tư duy rất sắc bén! Em xứng đáng là một kỹ sư nhí tương lai!",
        "Ý kiến rất độc đáo và đúng trọng tâm bài học!"
      ],
      encourage: [
        "Cố gắng lên một chút nữa thôi là đúng rồi em ơi!",
        "Không sao cả, em hãy quan sát kỹ lại câu hỏi một lần nữa nhé!",
        "Gần chính xác rồi! Cô tin lần sau em nhất định sẽ làm đúng!"
      ],
      champion: [
        "Chúc mừng Quán Quân của phần thi! Em đã về đích xuất sắc nhất!",
        "Vô cùng ấn tượng! Em là nhà vô địch của đấu trường hôm nay!",
        "Chiến thắng tuyệt đối! Em thật là tài năng!"
      ]
    };
  }

  playPraise(type = "excellent") {
    const clips = this.getPraiseClips();
    const list = clips[type] || clips.excellent;
    const randomClip = list[Math.floor(Math.random() * list.length)];
    
    this.playCelebrationDing();

    setTimeout(() => {
      this.speak(randomClip, { rate: 0.95, pitch: 1.25 });
    }, 250);

    window.app?.showToast?.(`🎙️ Cô Giáo: "${randomClip}"`, "success");
  }

  playCelebrationDing() {
    try {
      const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
      const freqs = [523.25, 659.25, 783.99, 1046.50];
      freqs.forEach((freq, idx) => {
        const osc = audioCtx.createOscillator();
        const gain = audioCtx.createGain();
        osc.type = "triangle";
        osc.frequency.setValueAtTime(freq, audioCtx.currentTime + idx * 0.08);
        gain.gain.setValueAtTime(0.2, audioCtx.currentTime + idx * 0.08);
        gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + idx * 0.08 + 0.6);
        osc.connect(gain);
        gain.connect(audioCtx.destination);
        osc.start(audioCtx.currentTime + idx * 0.08);
        osc.stop(audioCtx.currentTime + idx * 0.08 + 0.6);
      });
    } catch (e) {}
  }

  /**
   * PHÁT TIẾNG VỖ TAY GIÒN GIÃ & HOAN HÔ CHÚC MỪNG ĐIỂM 10 (WEB AUDIO API)
   * Tạo tiếng vỗ tay rộn ràng bằng chùm Noise Bursts và hợp âm kèn Fanfare
   */
  playApplause(duration = 3.0, withCheerVoice = true) {
    try {
      const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
      if (audioCtx.state === 'suspended') audioCtx.resume();

      // 1. Tạo chùm 40 tiếng vỗ tay ngẫu nhiên gối đầu nhau (Multi-burst Claps)
      const clapCount = 40;
      for (let i = 0; i < clapCount; i++) {
        const timeOffset = Math.random() * (duration - 0.2);
        const clapDuration = 0.04 + Math.random() * 0.05;
        
        const bufferSize = Math.floor(audioCtx.sampleRate * clapDuration);
        const buffer = audioCtx.createBuffer(1, bufferSize, audioCtx.sampleRate);
        const data = buffer.getChannelData(0);
        for (let j = 0; j < bufferSize; j++) {
          data[j] = (Math.random() * 2 - 1) * Math.exp(-j / (bufferSize * 0.35));
        }

        const source = audioCtx.createBufferSource();
        source.buffer = buffer;

        const filter = audioCtx.createBiquadFilter();
        filter.type = "bandpass";
        filter.frequency.setValueAtTime(800 + Math.random() * 1400, audioCtx.currentTime + timeOffset);
        filter.Q.setValueAtTime(1.8, audioCtx.currentTime + timeOffset);

        const gain = audioCtx.createGain();
        const baseGain = 0.08 + Math.random() * 0.16;
        gain.gain.setValueAtTime(baseGain, audioCtx.currentTime + timeOffset);
        gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + timeOffset + clapDuration);

        source.connect(filter);
        filter.connect(gain);
        gain.connect(audioCtx.destination);

        source.start(audioCtx.currentTime + timeOffset);
        source.stop(audioCtx.currentTime + timeOffset + clapDuration);
      }

      // 2. Kèn đồng Fanfare rực rỡ chúc mừng
      const fanfareNotes = [523.25, 659.25, 783.99, 1046.50, 1318.51];
      fanfareNotes.forEach((freq, idx) => {
        const osc = audioCtx.createOscillator();
        const gain = audioCtx.createGain();
        osc.type = "triangle";
        osc.frequency.setValueAtTime(freq, audioCtx.currentTime + idx * 0.12);
        gain.gain.setValueAtTime(0.18, audioCtx.currentTime + idx * 0.12);
        gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + idx * 0.12 + 0.9);
        osc.connect(gain);
        gain.connect(audioCtx.destination);
        osc.start(audioCtx.currentTime + idx * 0.12);
        osc.stop(audioCtx.currentTime + idx * 0.12 + 0.9);
      });

      // 3. Giọng cô giáo khen thưởng tự động
      if (withCheerVoice) {
        setTimeout(() => {
          this.speak("Xuất sắc quá! Cả lớp hãy cùng vỗ tay thật lớn khen ngợi bạn nào!");
        }, 200);
      }

      window.app?.showToast?.("👏 Tiếng vỗ tay hoan hô rộn ràng cả lớp!", "success");
    } catch (e) {
      console.warn("Không thể phát tiếng vỗ tay:", e);
    }
  }
}

window.ttsService = new TTSService();
