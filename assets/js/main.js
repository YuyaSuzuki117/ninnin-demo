/**
 * ポケカ専門店ニンニン - Main JavaScript
 * Vanilla ES6+ / jQuery不使用
 * パフォーマンス最優先 / アクセシビリティ対応
 * "Maximum POP" enhanced edition
 */
document.addEventListener("DOMContentLoaded", () => {
  "use strict";

  // ══════════════════════════════════════════
  //  Utilities
  // ══════════════════════════════════════════

  /**
   * throttle - 一定間隔でのみ関数を実行
   * @param {Function} fn - 実行する関数
   * @param {number} wait - 最小実行間隔（ms）
   * @returns {Function}
   */
  const throttle = (fn, wait) => {
    let lastTime = 0;
    return (...args) => {
      const now = Date.now();
      if (now - lastTime >= wait) {
        lastTime = now;
        fn(...args);
      }
    };
  };

  /**
   * debounce - 呼び出しが止まってから一定時間後に関数を実行
   * @param {Function} fn - 実行する関数
   * @param {number} delay - 遅延時間（ms）
   * @returns {Function}
   */
  const debounce = (fn, delay) => {
    let timer = null;
    return (...args) => {
      clearTimeout(timer);
      timer = setTimeout(() => fn(...args), delay);
    };
  };

  /** SP判定用 matchMedia */
  const spMediaQuery = window.matchMedia("(max-width: 768px)");

  /** アクセシビリティ: prefers-reduced-motion 判定 */
  const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");

  // ══════════════════════════════════════════
  //  1. SP ハンバーガーメニュー (with focus trap)
  // ══════════════════════════════════════════

  const dropBtn = document.querySelector(".drop_btn");
  const dropMenu = document.querySelector(".drop_menu");

  if (dropBtn && dropMenu) {
    /** メニュー内のフォーカス可能なリンク一覧を取得 */
    const getFocusableElements = () => {
      return [
        dropBtn,
        ...dropMenu.querySelectorAll('a[href], button, [tabindex]:not([tabindex="-1"])')
      ];
    };

    /** メニューを閉じる共通処理 */
    const closeMenu = () => {
      dropBtn.classList.remove("active");
      dropMenu.classList.remove("is-open");
      dropBtn.setAttribute("aria-expanded", "false");
      dropMenu.setAttribute("aria-hidden", "true");
    };

    /** メニューを開く共通処理 */
    const openMenu = () => {
      dropBtn.classList.add("active");
      dropMenu.classList.add("is-open");
      dropBtn.setAttribute("aria-expanded", "true");
      dropMenu.setAttribute("aria-hidden", "false");
      // 開いた直後にメニュー内の最初のリンクへフォーカス
      const firstLink = dropMenu.querySelector("a");
      if (firstLink) {
        firstLink.focus();
      }
    };

    /** メニューが開いているか判定 */
    const isMenuOpen = () => dropBtn.classList.contains("active");

    // ハンバーガーボタンのクリック
    dropBtn.addEventListener("click", () => {
      if (isMenuOpen()) {
        closeMenu();
      } else {
        openMenu();
      }
    });

    // メニュー内リンククリックで閉じる
    dropMenu.querySelectorAll("a").forEach((link) => {
      link.addEventListener("click", closeMenu);
    });

    // キーボードイベント: ESCで閉じる + フォーカストラップ
    document.addEventListener("keydown", (e) => {
      if (!isMenuOpen()) return;

      // ESCキーで閉じる
      if (e.key === "Escape") {
        closeMenu();
        dropBtn.focus();
        return;
      }

      // フォーカストラップ: Tab / Shift+Tab
      if (e.key === "Tab") {
        const focusable = getFocusableElements();
        if (focusable.length === 0) return;

        const firstEl = focusable[0];
        const lastEl = focusable[focusable.length - 1];

        if (e.shiftKey) {
          // Shift+Tab: 最初の要素にいたら最後へ
          if (document.activeElement === firstEl) {
            e.preventDefault();
            lastEl.focus();
          }
        } else {
          // Tab: 最後の要素にいたら最初へ
          if (document.activeElement === lastEl) {
            e.preventDefault();
            firstEl.focus();
          }
        }
      }
    });

    // メニュー外クリックで閉じる
    document.addEventListener("click", (e) => {
      if (isMenuOpen() && !dropBtn.contains(e.target) && !dropMenu.contains(e.target)) {
        closeMenu();
      }
    });
  }

  // ══════════════════════════════════════════
  //  2. スムーススクロール
  // ══════════════════════════════════════════

  document.addEventListener("click", (e) => {
    const anchor = e.target.closest('a[href^="#"]');
    if (!anchor) return;

    const href = anchor.getAttribute("href");
    if (!href || href === "#") {
      e.preventDefault();
      window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }

    const target = document.querySelector(href);
    if (target) {
      e.preventDefault();
      const siteHeaderEl = document.querySelector(".site-header");
      const headerHeight = siteHeaderEl ? siteHeaderEl.offsetHeight : 0;
      const topPos =
        target.getBoundingClientRect().top +
        window.scrollY -
        headerHeight -
        10;
      window.scrollTo({ top: topPos, behavior: "smooth" });
    }
  });

  // ══════════════════════════════════════════
  //  3. ページトップボタン（PC + SP）
  // ══════════════════════════════════════════

  const pageTopBtn = document.getElementById("pageTop");
  const pageTopSpBtn = document.getElementById("pageTopSp");

  /** ページトップボタンの表示/非表示を切り替え */
  const togglePageTopButtons = () => {
    const scrolled = window.scrollY > 300;
    if (pageTopBtn) {
      pageTopBtn.classList.toggle("is-visible", scrolled);
    }
    if (pageTopSpBtn) {
      pageTopSpBtn.classList.toggle("is-visible", scrolled);
    }
  };

  if (pageTopBtn || pageTopSpBtn) {
    window.addEventListener("scroll", throttle(togglePageTopButtons, 50), {
      passive: true,
    });
    togglePageTopButtons();
  }

  // ══════════════════════════════════════════
  //  4. PCスティッキーヘッダー
  // ══════════════════════════════════════════

  const siteHeader = document.querySelector(".site-header");

  if (siteHeader) {
    /** スクロール100px超で .is-scrolled クラスをトグル */
    const handleStickyHeader = () => {
      siteHeader.classList.toggle("is-scrolled", window.scrollY > 100);
    };

    window.addEventListener("scroll", throttle(handleStickyHeader, 50), {
      passive: true,
    });
    handleStickyHeader();
  }

  // ══════════════════════════════════════════
  //  4b. Scroll-hide SP Header
  // ══════════════════════════════════════════

  if (siteHeader && spMediaQuery.matches) {
    let lastScrollY = 0;
    const headerHeight = 54;

    window.addEventListener("scroll", throttle(() => {
      const currentScrollY = window.scrollY;
      if (currentScrollY > headerHeight) {
        if (currentScrollY > lastScrollY) {
          siteHeader.classList.add("is-hidden");
        } else {
          siteHeader.classList.remove("is-hidden");
        }
      } else {
        siteHeader.classList.remove("is-hidden");
      }
      lastScrollY = currentScrollY;
    }, 50), { passive: true });
  }

  // ══════════════════════════════════════════
  //  5. スクロールプログレスバー
  // ══════════════════════════════════════════

  const progressBar = document.querySelector(".scroll-progress");

  if (progressBar) {
    window.addEventListener("scroll", throttle(() => {
      const scrollTop = window.scrollY;
      const docHeight = document.documentElement.scrollHeight - window.innerHeight;
      const scrollPercent = docHeight > 0 ? (scrollTop / docHeight) * 100 : 0;
      progressBar.style.width = scrollPercent + "%";
    }, 16), { passive: true });
  }

  // ══════════════════════════════════════════
  //  6. スクロールフェードインアニメーション (IntersectionObserver)
  // ══════════════════════════════════════════

  const fadeElements = document.querySelectorAll(".fade-in");

  if (fadeElements.length) {
    // reduced-motion時はフェードインをスキップして即座に表示
    if (prefersReducedMotion.matches) {
      fadeElements.forEach((el) => el.classList.add("is-visible"));
    } else {
      const fadeObserver = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              entry.target.classList.add("is-visible");
              fadeObserver.unobserve(entry.target);
            }
          });
        },
        { threshold: 0.1 }
      );

      fadeElements.forEach((el) => {
        fadeObserver.observe(el);
      });
    }
  }

  // ══════════════════════════════════════════
  //  7. 統計カウントアップ (.stat-num) - 画面外一時停止対応
  // ══════════════════════════════════════════

  const statNums = document.querySelectorAll(".stat-num");

  if (statNums.length) {
    /**
     * テキストからターゲット数値・サフィックスを解析
     * "50,000" -> { value: 50000, suffix: "", hasComma: true }
     * "7"      -> { value: 7,     suffix: "", hasComma: false }
     * "10%"    -> { value: 10,    suffix: "%", hasComma: false }
     */
    const parseStatValue = (text) => {
      const trimmed = text.trim();
      const match = trimmed.match(/^([0-9,]+)(.*)$/);
      if (!match) return null;

      const numStr = match[1];
      const suffix = match[2] || "";
      const hasComma = numStr.includes(",");
      const value = parseInt(numStr.replace(/,/g, ""), 10);

      if (isNaN(value)) return null;
      return { value, suffix, hasComma };
    };

    /** 数値をカンマ区切りでフォーマット */
    const formatNumber = (num, useComma) => {
      if (!useComma) return String(num);
      return num.toLocaleString("ja-JP");
    };

    /** イージング関数 (ease-out cubic) */
    const easeOutCubic = (t) => 1 - Math.pow(1 - t, 3);

    /**
     * カウントアップアニメーション（画面外一時停止対応）
     * IntersectionObserverで要素が画面内にあるかを監視し、
     * 画面外に出たら経過時間を一時停止する
     */
    const animateCount = (el, target, suffix, hasComma, duration = 2000) => {
      // reduced-motion時は即座に最終値を表示
      if (prefersReducedMotion.matches) {
        el.textContent = formatNumber(target, hasComma) + suffix;
        return;
      }

      let elapsed = 0;
      let lastFrameTime = null;
      let isPaused = false;
      let animDone = false;

      // 画面内/外の監視用Observer
      const visibilityObserver = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              isPaused = false;
              lastFrameTime = performance.now();
              if (!animDone) {
                requestAnimationFrame(update);
              }
            } else {
              isPaused = true;
            }
          });
        },
        { threshold: 0.1 }
      );
      visibilityObserver.observe(el);

      const update = (currentTime) => {
        if (isPaused || animDone) return;

        if (lastFrameTime !== null) {
          elapsed += currentTime - lastFrameTime;
        }
        lastFrameTime = currentTime;

        const progress = Math.min(elapsed / duration, 1);
        const easedProgress = easeOutCubic(progress);
        const currentValue = Math.round(easedProgress * target);

        el.textContent = formatNumber(currentValue, hasComma) + suffix;

        if (progress < 1) {
          requestAnimationFrame(update);
        } else {
          animDone = true;
          visibilityObserver.unobserve(el);
        }
      };

      // 初回開始（既に画面内にいるはず）
      lastFrameTime = performance.now();
      requestAnimationFrame(update);
    };

    const statObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const el = entry.target;
            const parsed = parseStatValue(el.textContent);

            if (parsed) {
              el.textContent = "0" + parsed.suffix;
              animateCount(el, parsed.value, parsed.suffix, parsed.hasComma, 2000);
            }

            statObserver.unobserve(el);
          }
        });
      },
      { threshold: 0.5 }
    );

    statNums.forEach((el) => {
      statObserver.observe(el);
    });
  }

  // ══════════════════════════════════════════
  //  8. FAQ アコーディオンアニメーション (details/summary) + aria-expanded同期
  // ══════════════════════════════════════════

  const faqItems = document.querySelectorAll(".faq-item");

  if (faqItems.length) {
    faqItems.forEach((details) => {
      const summary = details.querySelector("summary");
      if (!summary) return;

      // aria-expanded 初期値をセット
      summary.setAttribute("aria-expanded", details.open ? "true" : "false");

      // summary 以外のコンテンツをラッパーで囲む
      const contentNodes = [];
      let sibling = summary.nextSibling;
      while (sibling) {
        contentNodes.push(sibling);
        sibling = sibling.nextSibling;
      }

      // 既にラッパーがある場合はスキップ
      if (
        contentNodes.length === 1 &&
        contentNodes[0].classList &&
        contentNodes[0].classList.contains("faq-content-wrapper")
      ) {
        return;
      }

      const wrapper = document.createElement("div");
      wrapper.className = "faq-content-wrapper";
      wrapper.style.overflow = "hidden";
      wrapper.style.transition = prefersReducedMotion.matches
        ? "none"
        : "max-height 0.3s ease, opacity 0.3s ease";
      wrapper.style.maxHeight = details.open ? "none" : "0";
      wrapper.style.opacity = details.open ? "1" : "0";
      contentNodes.forEach((node) => wrapper.appendChild(node));
      details.appendChild(wrapper);

      // アニメーション中フラグ（連打防止）
      let isAnimating = false;

      summary.addEventListener("click", (e) => {
        e.preventDefault();

        if (isAnimating) return;
        isAnimating = true;

        if (details.open) {
          // ── 閉じるアニメーション ──
          summary.setAttribute("aria-expanded", "false");

          if (prefersReducedMotion.matches) {
            wrapper.style.maxHeight = "0";
            wrapper.style.opacity = "0";
            details.removeAttribute("open");
            isAnimating = false;
            return;
          }

          wrapper.style.maxHeight = wrapper.scrollHeight + "px";
          requestAnimationFrame(() => {
            requestAnimationFrame(() => {
              wrapper.style.maxHeight = "0";
              wrapper.style.opacity = "0";
            });
          });
          const onClose = () => {
            wrapper.removeEventListener("transitionend", onClose);
            details.removeAttribute("open");
            isAnimating = false;
          };
          wrapper.addEventListener("transitionend", onClose);
        } else {
          // ── 開くアニメーション ──
          details.setAttribute("open", "");
          summary.setAttribute("aria-expanded", "true");

          if (prefersReducedMotion.matches) {
            wrapper.style.maxHeight = "none";
            wrapper.style.opacity = "1";
            isAnimating = false;
            return;
          }

          const height = wrapper.scrollHeight;
          wrapper.style.maxHeight = "0";
          wrapper.style.opacity = "0";
          requestAnimationFrame(() => {
            requestAnimationFrame(() => {
              wrapper.style.maxHeight = height + "px";
              wrapper.style.opacity = "1";
            });
          });
          const onOpen = () => {
            wrapper.removeEventListener("transitionend", onOpen);
            wrapper.style.maxHeight = "none";
            isAnimating = false;
          };
          wrapper.addEventListener("transitionend", onOpen);
        }
      });
    });
  }

  // ══════════════════════════════════════════
  //  9. フォームバリデーション (#contact form)
  // ══════════════════════════════════════════

  const contactSection = document.getElementById("contact");
  const contactForm = contactSection ? contactSection.querySelector("form") : null;

  if (contactForm) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const katakanaRegex = /^[ァ-ヶー　\s]+$/;
    const phoneRegex = /^[0-9\-]{10,13}$/;

    /**
     * エラーメッセージを表示（インラインスタイル不使用・CSSクラスのみ）
     * @param {HTMLElement} field - 対象のフォームフィールド
     * @param {string} message - エラーメッセージ
     */
    const showError = (field, message) => {
      const group = field.closest(".form-group");
      if (!group) return;

      // 既存のエラーをクリア
      clearError(field);

      group.classList.add("is-invalid");
      field.setAttribute("aria-invalid", "true");

      const errorEl = document.createElement("span");
      errorEl.className = "error-message";
      errorEl.id = `error-${field.name}`;
      errorEl.textContent = message;
      errorEl.setAttribute("role", "alert");
      field.setAttribute("aria-describedby", errorEl.id);
      group.appendChild(errorEl);
    };

    /**
     * エラーメッセージをクリア
     * @param {HTMLElement} field - 対象のフォームフィールド
     */
    const clearError = (field) => {
      const group = field.closest(".form-group");
      if (!group) return;

      group.classList.remove("is-invalid");
      field.removeAttribute("aria-invalid");
      field.removeAttribute("aria-describedby");

      const existing = group.querySelector(".error-message");
      if (existing) existing.remove();
    };

    /**
     * 個別フィールドのバリデーション
     * @param {HTMLElement} field - 対象のフォームフィールド
     * @returns {boolean} バリデーション結果
     */
    const validateField = (field) => {
      const name = field.getAttribute("name") || field.id || "";
      const value = field.value.trim();
      const tagName = field.tagName.toLowerCase();

      clearError(field);

      // お名前: 必須
      if (name === "name") {
        if (!value) {
          showError(field, "お名前を入力してください。");
          return false;
        }
        return true;
      }

      // お名前（フリガナ）: 必須 + カタカナチェック
      // name="furigana" / name="kana" / name="name-kana" に対応
      if (name === "furigana" || name === "kana" || name === "name-kana") {
        if (!value) {
          showError(field, "フリガナを入力してください。");
          return false;
        }
        if (!katakanaRegex.test(value)) {
          showError(field, "カタカナで入力してください。");
          return false;
        }
        return true;
      }

      // メールアドレス: 必須 + フォーマット検証
      if (name === "email") {
        if (!value) {
          showError(field, "メールアドレスを入力してください。");
          return false;
        }
        if (!emailRegex.test(value)) {
          showError(field, "正しいメールアドレスを入力してください。");
          return false;
        }
        return true;
      }

      // 電話番号: 必須 + フォーマット
      if (name === "phone" || name === "tel") {
        if (!value) {
          showError(field, "電話番号を入力してください。");
          return false;
        }
        if (!phoneRegex.test(value)) {
          showError(field, "正しい電話番号を入力してください（例: 090-1234-5678）。");
          return false;
        }
        return true;
      }

      // お問い合わせ種別: 必須（select）
      // name="inquiry_type" / name="inquiry-type" / name="type" に対応
      if (name === "inquiry_type" || name === "inquiry-type" || name === "type") {
        if (tagName === "select" && (!value || value === "")) {
          showError(field, "お問い合わせ種別を選択してください。");
          return false;
        }
        return true;
      }

      // プライバシーポリシー同意: チェック必須
      if (name === "privacy" || name === "agree") {
        if (field.type === "checkbox" && !field.checked) {
          showError(field, "プライバシーポリシーに同意してください。");
          return false;
        }
        return true;
      }

      return true;
    };

    // リアルタイムバリデーション: blurイベントで各フィールドを個別チェック
    const formFields = contactForm.querySelectorAll("input, select, textarea");
    formFields.forEach((field) => {
      field.addEventListener("blur", () => {
        validateField(field);
      });
    });

    // 送信時: 全フィールドチェック
    contactForm.addEventListener("submit", (e) => {
      e.preventDefault();

      let isValid = true;

      formFields.forEach((field) => {
        // hidden, submit, buttonタイプはスキップ
        if (field.type === "hidden" || field.type === "submit" || field.type === "button") return;
        if (!validateField(field)) {
          isValid = false;
        }
      });

      if (isValid) {
        alert("デモサイトのため、実際には送信されません。");
      }
    });
  }

  // ══════════════════════════════════════════
  //  10. レビュースライダー（SP対応） (.review-cards)
  // ══════════════════════════════════════════

  const reviewContainer = document.querySelector(".review-cards");

  if (reviewContainer) {
    let isDown = false;
    let startX = 0;
    let scrollLeft = 0;

    // スライダー用スタイルを注入（SP時のみ）
    const sliderStyle = document.createElement("style");
    sliderStyle.textContent = `
      @media (max-width: 768px) {
        .review-cards {
          display: flex;
          gap: 15px;
          overflow-x: auto;
          overflow-y: hidden;
          scroll-snap-type: x mandatory;
          -webkit-overflow-scrolling: touch;
          scrollbar-width: none;
          padding-bottom: 10px;
          cursor: grab;
        }
        .review-cards::-webkit-scrollbar {
          display: none;
        }
        .review-cards.is-grabbing {
          cursor: grabbing;
          scroll-snap-type: none;
        }
        .review-cards > * {
          flex-shrink: 0;
          width: 85%;
          scroll-snap-align: start;
        }
      }
    `;
    document.head.appendChild(sliderStyle);

    // マウスドラッグ対応
    reviewContainer.addEventListener("mousedown", (e) => {
      if (!spMediaQuery.matches) return;
      isDown = true;
      reviewContainer.classList.add("is-grabbing");
      startX = e.pageX - reviewContainer.offsetLeft;
      scrollLeft = reviewContainer.scrollLeft;
    });

    reviewContainer.addEventListener("mouseleave", () => {
      isDown = false;
      reviewContainer.classList.remove("is-grabbing");
    });

    reviewContainer.addEventListener("mouseup", () => {
      isDown = false;
      reviewContainer.classList.remove("is-grabbing");
    });

    reviewContainer.addEventListener("mousemove", (e) => {
      if (!isDown) return;
      e.preventDefault();
      const x = e.pageX - reviewContainer.offsetLeft;
      const walk = (x - startX) * 1.5;
      reviewContainer.scrollLeft = scrollLeft - walk;
    });

    // タッチスワイプ対応（全リスナー passive: true）
    let touchStartX = 0;
    let touchScrollLeft = 0;

    reviewContainer.addEventListener(
      "touchstart",
      (e) => {
        touchStartX = e.touches[0].pageX;
        touchScrollLeft = reviewContainer.scrollLeft;
      },
      { passive: true }
    );

    reviewContainer.addEventListener(
      "touchmove",
      (e) => {
        const x = e.touches[0].pageX;
        const walk = (touchStartX - x) * 1.2;
        reviewContainer.scrollLeft = touchScrollLeft + walk;
      },
      { passive: true }
    );

    // resize時の再初期化（debounce使用: 250ms）
    const handleSliderResize = debounce(() => {
      if (!spMediaQuery.matches) {
        // PC表示に切り替わったらスクロール位置をリセット
        reviewContainer.scrollLeft = 0;
        reviewContainer.classList.remove("is-grabbing");
        isDown = false;
      }
    }, 250);

    window.addEventListener("resize", handleSliderResize, { passive: true });
  }

  // ══════════════════════════════════════════
  //  11. 買取価格カードの3Dホバーエフェクト (.price-card)
  //      - requestAnimationFrame でバッチ処理
  //      - will-change はホバー時のみ付与
  // ══════════════════════════════════════════

  const priceCards = document.querySelectorAll(".price-card");

  if (priceCards.length) {
    // タッチデバイス判定: SP時は無効
    const isTouchDevice = () =>
      "ontouchstart" in window || navigator.maxTouchPoints > 0;

    priceCards.forEach((card) => {
      card.classList.add("price-card--3d");

      let ticking = false;

      card.addEventListener("mouseenter", () => {
        if (isTouchDevice() || prefersReducedMotion.matches) return;
        card.style.willChange = "transform";
      });

      card.addEventListener("mousemove", (e) => {
        if (isTouchDevice() || prefersReducedMotion.matches) return;

        if (!ticking) {
          requestAnimationFrame(() => {
            const rect = card.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            const centerX = rect.width / 2;
            const centerY = rect.height / 2;

            // 中心からの距離を -1 ~ 1 に正規化
            const rotateY = ((x - centerX) / centerX) * 8;  // 最大8度
            const rotateX = ((centerY - y) / centerY) * 8;  // 最大8度

            card.style.transform =
              `perspective(1000px) rotateY(${rotateY}deg) rotateX(${rotateX}deg)`;

            ticking = false;
          });
          ticking = true;
        }
      }, { passive: true });

      card.addEventListener("mouseleave", () => {
        card.style.transform = "perspective(1000px) rotateY(0deg) rotateX(0deg)";
        card.style.willChange = "auto";
        ticking = false;
      });
    });
  }

  // ══════════════════════════════════════════
  //  12. [REMOVED - placeholder for numbering alignment]
  //      Original features 1-11 preserved above.
  //      New features 13-17 begin below.
  // ══════════════════════════════════════════

  // ══════════════════════════════════════════
  //  13. SPARKLE EFFECT - ヒーローセクション キラキラ
  //      ランダムに星パーティクルを生成し、CSSアニメで表示→フェードアウト→除去
  //      一度に5~8個のみ。throttleで生成頻度を制限。
  //      prefers-reduced-motion 時はスキップ。
  // ══════════════════════════════════════════

  const heroSection = document.querySelector(".hero");

  if (heroSection && !prefersReducedMotion.matches) {
    // スパークル用CSSをインジェクト（軽量キーフレーム）
    const sparkleStyle = document.createElement("style");
    sparkleStyle.textContent = `
      .sparkle {
        position: absolute;
        width: 8px;
        height: 8px;
        pointer-events: none;
        z-index: 5;
        animation: sparkle-pop 0.8s ease-out forwards;
      }
      .sparkle::before,
      .sparkle::after {
        content: "";
        position: absolute;
        background: #FFCB05;
      }
      .sparkle::before {
        width: 100%;
        height: 2px;
        top: 50%;
        left: 0;
        transform: translateY(-50%);
        border-radius: 1px;
      }
      .sparkle::after {
        width: 2px;
        height: 100%;
        left: 50%;
        top: 0;
        transform: translateX(-50%);
        border-radius: 1px;
      }
      .sparkle--large {
        width: 12px;
        height: 12px;
      }
      .sparkle--white::before,
      .sparkle--white::after {
        background: #fff;
      }
      @keyframes sparkle-pop {
        0% {
          opacity: 0;
          transform: scale(0) rotate(0deg);
        }
        30% {
          opacity: 1;
          transform: scale(1.2) rotate(20deg);
        }
        100% {
          opacity: 0;
          transform: scale(0.5) rotate(45deg);
        }
      }
    `;
    document.head.appendChild(sparkleStyle);

    // heroセクションをposition:relativeにする（パーティクル配置のため）
    const heroComputedPos = getComputedStyle(heroSection).position;
    if (heroComputedPos === "static") {
      heroSection.style.position = "relative";
    }
    heroSection.style.overflow = "hidden";

    /** 現在のスパークル数 */
    let activeSparkles = 0;
    const MAX_SPARKLES = 8;

    /** 単一スパークルを生成 */
    const createSparkle = () => {
      if (activeSparkles >= MAX_SPARKLES) return;

      const sparkle = document.createElement("span");
      sparkle.className = "sparkle";
      sparkle.setAttribute("aria-hidden", "true");

      // ランダムなバリエーション
      if (Math.random() > 0.5) sparkle.classList.add("sparkle--large");
      if (Math.random() > 0.6) sparkle.classList.add("sparkle--white");

      // ランダム位置（ヒーロー内）
      const x = Math.random() * 100;
      const y = Math.random() * 100;
      sparkle.style.left = x + "%";
      sparkle.style.top = y + "%";

      // アニメーション時間をランダムに少しばらつかせる
      const duration = 0.6 + Math.random() * 0.5;
      sparkle.style.animationDuration = duration + "s";

      heroSection.appendChild(sparkle);
      activeSparkles++;

      // アニメーション終了で自動削除
      sparkle.addEventListener("animationend", () => {
        sparkle.remove();
        activeSparkles--;
      }, { once: true });
    };

    /** バッチでスパークルを生成（5~8個） */
    const spawnSparkles = () => {
      const count = 5 + Math.floor(Math.random() * 4); // 5~8
      for (let i = 0; i < count; i++) {
        // 少し時差をつけて生成
        setTimeout(createSparkle, i * 80);
      }
    };

    // IntersectionObserverでheroが画面内のときだけスパークルを出す
    let sparkleInterval = null;

    const sparkleObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            // 初回即生成 + インターバル
            spawnSparkles();
            sparkleInterval = setInterval(spawnSparkles, 2000);
          } else {
            if (sparkleInterval) {
              clearInterval(sparkleInterval);
              sparkleInterval = null;
            }
          }
        });
      },
      { threshold: 0.1 }
    );

    sparkleObserver.observe(heroSection);
  }

  // ══════════════════════════════════════════
  //  14. SCROLL-TRIGGERED SECTION TAGS - タイプライター効果
  //      .section-tag 要素が画面内に入ったとき、
  //      文字を1文字ずつ遅延付きで表示する。
  //      prefers-reduced-motion 時はスキップ（即座に全文表示）。
  // ══════════════════════════════════════════

  const sectionTags = document.querySelectorAll(".section-tag");

  if (sectionTags.length) {
    // タイプライター用CSS
    const typewriterStyle = document.createElement("style");
    typewriterStyle.textContent = `
      .section-tag--typewriter .section-tag__char {
        opacity: 0;
        display: inline-block;
        transition: opacity 0.15s ease;
      }
      .section-tag--typewriter .section-tag__char.is-revealed {
        opacity: 1;
      }
      .section-tag--typewriter .section-tag__cursor {
        display: inline-block;
        width: 2px;
        height: 1em;
        background: currentColor;
        margin-left: 2px;
        vertical-align: text-bottom;
        animation: typewriter-blink 0.6s step-end infinite;
      }
      .section-tag--typewriter .section-tag__cursor.is-done {
        animation: typewriter-blink-out 0.6s step-end forwards;
      }
      @keyframes typewriter-blink {
        0%, 100% { opacity: 1; }
        50% { opacity: 0; }
      }
      @keyframes typewriter-blink-out {
        0% { opacity: 1; }
        100% { opacity: 0; }
      }
    `;
    document.head.appendChild(typewriterStyle);

    if (prefersReducedMotion.matches) {
      // reduced-motion: 即座に表示（何も変更しない）
    } else {
      sectionTags.forEach((tag) => {
        const originalText = tag.textContent;
        tag.textContent = "";
        tag.classList.add("section-tag--typewriter");

        // テキストを1文字ずつspan化
        const chars = [];
        for (const char of originalText) {
          const span = document.createElement("span");
          span.className = "section-tag__char";
          span.textContent = char;
          tag.appendChild(span);
          chars.push(span);
        }

        // カーソルを追加
        const cursor = document.createElement("span");
        cursor.className = "section-tag__cursor";
        cursor.setAttribute("aria-hidden", "true");
        tag.appendChild(cursor);

        // IntersectionObserverでビューポート進入時にタイプライター開始
        const tagObserver = new IntersectionObserver(
          (entries) => {
            entries.forEach((entry) => {
              if (entry.isIntersecting) {
                tagObserver.unobserve(entry.target);

                // 文字を順に表示
                chars.forEach((charSpan, i) => {
                  setTimeout(() => {
                    requestAnimationFrame(() => {
                      charSpan.classList.add("is-revealed");
                    });
                  }, i * 50); // 50msずつ遅延
                });

                // 全文字表示後、カーソルをフェードアウト
                setTimeout(() => {
                  cursor.classList.add("is-done");
                }, chars.length * 50 + 600);
              }
            });
          },
          { threshold: 0.5 }
        );

        tagObserver.observe(tag);
      });
    }
  }

  // ══════════════════════════════════════════
  //  15. HOLO SHINE ON SCROLL - ホログラフィックシャイン
  //      .price-card 要素上でマウスホバー時、
  //      マウスX位置に基づいてCSS custom property --shine-x を更新。
  //      CSSグラデーション等で輝きに利用可能。
  //      requestAnimationFrame で視覚更新をバッチ処理。
  // ══════════════════════════════════════════

  if (priceCards.length && !prefersReducedMotion.matches) {
    // タッチデバイスではスキップ
    const isTouchDevice = () =>
      "ontouchstart" in window || navigator.maxTouchPoints > 0;

    priceCards.forEach((card) => {
      let shineRafPending = false;

      card.addEventListener("mousemove", (e) => {
        if (isTouchDevice()) return;

        if (!shineRafPending) {
          requestAnimationFrame(() => {
            const rect = card.getBoundingClientRect();
            const x = e.clientX - rect.left;
            // 0~100% の範囲で --shine-x を設定
            const percent = Math.round((x / rect.width) * 100);
            card.style.setProperty("--shine-x", percent + "%");
            shineRafPending = false;
          });
          shineRafPending = true;
        }
      }, { passive: true });

      card.addEventListener("mouseleave", () => {
        // リセット: 中央に戻す
        card.style.setProperty("--shine-x", "50%");
      });

      // 初期値を設定
      card.style.setProperty("--shine-x", "50%");
    });
  }

  // ══════════════════════════════════════════
  //  16. POKEBALL SPIN ON SCROLL - モンスターボール回転
  //      .deco-pokeball 要素がビューポート内にあるとき回転クラスを付与。
  //      IntersectionObserver を使用。
  //      prefers-reduced-motion 時はスキップ。
  // ══════════════════════════════════════════

  const decoPokeballs = document.querySelectorAll(".deco-pokeball");

  if (decoPokeballs.length && !prefersReducedMotion.matches) {
    // 回転アニメーション用CSS
    const pokeballStyle = document.createElement("style");
    pokeballStyle.textContent = `
      .deco-pokeball--spinning {
        animation: pokeball-spin 8s linear infinite;
      }
      @keyframes pokeball-spin {
        from { transform: rotate(0deg); }
        to { transform: rotate(360deg); }
      }
    `;
    document.head.appendChild(pokeballStyle);

    const pokeballObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("deco-pokeball--spinning");
          } else {
            entry.target.classList.remove("deco-pokeball--spinning");
          }
        });
      },
      { threshold: 0.0 }
    );

    decoPokeballs.forEach((ball) => {
      pokeballObserver.observe(ball);
    });
  }

  // ══════════════════════════════════════════
  //  17. SCROLL INDICATOR HIDE
  //      ユーザーが200pxスクロールしたら .scroll-indicator をフェードアウト。
  //      throttle で負荷軽減。
  // ══════════════════════════════════════════

  const scrollIndicator = document.querySelector(".scroll-indicator");

  if (scrollIndicator) {
    // フェードアウト用CSS
    const indicatorStyle = document.createElement("style");
    indicatorStyle.textContent = `
      .scroll-indicator {
        transition: opacity 0.4s ease, visibility 0.4s ease;
      }
      .scroll-indicator.is-hidden {
        opacity: 0;
        visibility: hidden;
        pointer-events: none;
      }
    `;
    document.head.appendChild(indicatorStyle);

    const handleScrollIndicator = () => {
      if (window.scrollY > 200) {
        scrollIndicator.classList.add("is-hidden");
      } else {
        scrollIndicator.classList.remove("is-hidden");
      }
    };

    window.addEventListener("scroll", throttle(handleScrollIndicator, 100), {
      passive: true,
    });

    // 初期状態を反映
    handleScrollIndicator();
  }
});
