/**
 * ポケカ専門店ニンニン - Main JavaScript
 * 鷹ノ羽陸運パターン踏襲
 */
document.addEventListener("DOMContentLoaded", function () {
  "use strict";

  /* ========================================
   * Utility: throttle
   * ======================================== */
  function throttle(fn, wait) {
    var lastTime = 0;
    return function () {
      var now = Date.now();
      if (now - lastTime >= wait) {
        lastTime = now;
        fn.apply(null, arguments);
      }
    };
  }

  /* ========================================
   * 1. SP Hamburger Menu（鷹ノ羽パターン：.drop_btn）
   * ======================================== */
  var dropBtn = document.querySelector(".drop_btn");
  var dropMenu = document.querySelector(".drop_menu");

  if (dropBtn && dropMenu) {
    dropBtn.addEventListener("click", function () {
      var isOpen = dropBtn.classList.toggle("active");
      dropMenu.classList.toggle("is-open");
      dropBtn.setAttribute("aria-expanded", String(isOpen));
      dropMenu.setAttribute("aria-hidden", String(!isOpen));
    });

    var menuLinks = dropMenu.querySelectorAll("a");
    for (var i = 0; i < menuLinks.length; i++) {
      menuLinks[i].addEventListener("click", function () {
        dropBtn.classList.remove("active");
        dropMenu.classList.remove("is-open");
        dropBtn.setAttribute("aria-expanded", "false");
        dropMenu.setAttribute("aria-hidden", "true");
      });
    }
  }

  /* ========================================
   * 2. Smooth Scroll（SPヘッダーオフセット対応）
   * ======================================== */
  document.addEventListener("click", function (e) {
    var anchor = e.target.closest('a[href^="#"]');
    if (!anchor) return;

    var href = anchor.getAttribute("href");
    if (!href || href === "#") {
      e.preventDefault();
      window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }

    var target = document.querySelector(href);
    if (target) {
      e.preventDefault();
      var headerHeight = 0;
      var spHeader = document.querySelector(".sp_header");
      if (spHeader && window.getComputedStyle(spHeader).display !== "none") {
        headerHeight = spHeader.offsetHeight;
      }
      var topPos = target.getBoundingClientRect().top + window.pageYOffset - headerHeight - 10;
      window.scrollTo({ top: topPos, behavior: "smooth" });
    }
  });

  /* ========================================
   * 3. Page Top Button（鷹ノ羽パターン）
   * ======================================== */
  var pageTopBtn = document.getElementById("pageTop");

  if (pageTopBtn) {
    var togglePageTop = function () {
      if (window.pageYOffset > 200) {
        pageTopBtn.classList.add("is-visible");
      } else {
        pageTopBtn.classList.remove("is-visible");
      }
    };

    window.addEventListener("scroll", throttle(togglePageTop, 100), { passive: true });
    togglePageTop();
  }

  /* ========================================
   * 4. Page Top Button SP
   * ======================================== */
  var pageTopSpBtn = document.getElementById("pageTopSp");
  if (pageTopSpBtn) {
    pageTopSpBtn.addEventListener("click", function (e) {
      e.preventDefault();
      window.scrollTo({ top: 0, behavior: "smooth" });
    });
  }

  /* ========================================
   * 5. Fade-in on Scroll（IntersectionObserver）
   * ======================================== */
  var fadeElements = document.querySelectorAll(".service .item, .step-item, .category-card, .shop-card, .about-point, .blog_area li");

  if ("IntersectionObserver" in window && fadeElements.length) {
    fadeElements.forEach(function (el) {
      el.style.opacity = "0";
      el.style.transform = "translateY(20px)";
      el.style.transition = "opacity 0.6s ease, transform 0.6s ease";
    });

    var observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.style.opacity = "1";
          entry.target.style.transform = "translateY(0)";
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.1, rootMargin: "0px 0px -50px 0px" });

    fadeElements.forEach(function (el) {
      observer.observe(el);
    });
  }
});
