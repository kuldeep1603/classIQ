(() => {
  const USERS_KEY = "classiq_users";
  const SESSION_KEY = "classiq_session";
  const ENROLL_KEY = "classiq_enrollments";
  const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

  const $ = (sel, ctx = document) => ctx.querySelector(sel);
  const $$ = (sel, ctx = document) => [...ctx.querySelectorAll(sel)];

  const store = {
    get(key, fallback) {
      try {
        const value = localStorage.getItem(key);
        return value ? JSON.parse(value) : fallback;
      } catch {
        return fallback;
      }
    },
    set(key, value) {
      try {
        localStorage.setItem(key, JSON.stringify(value));
      } catch {}
    },
    remove(key) {
      try {
        localStorage.removeItem(key);
      } catch {}
    },
  };

  const getUsers = () => store.get(USERS_KEY, []);
  const getSession = () => store.get(SESSION_KEY, null);
  const findUser = (email) => getUsers().find((u) => u.email === email.toLowerCase());

  let toastTimer;
  function showToast(message) {
    const toast = $("[data-toast]");
    if (!toast) return;
    toast.textContent = message;
    toast.classList.add("is-visible");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => toast.classList.remove("is-visible"), 2600);
  }

  function initNav() {
    const toggle = $(".nav-toggle");
    const menu = $("#nav-menu");
    if (!toggle || !menu) return;

    const setOpen = (open) => {
      menu.classList.toggle("is-open", open);
      toggle.setAttribute("aria-expanded", String(open));
      toggle.setAttribute("aria-label", open ? "Close menu" : "Open menu");
    };

    toggle.addEventListener("click", () => setOpen(!menu.classList.contains("is-open")));

    menu.addEventListener("click", (e) => {
      if (e.target.closest("a, button")) setOpen(false);
    });

    document.addEventListener("click", (e) => {
      if (!menu.contains(e.target) && !toggle.contains(e.target)) setOpen(false);
    });

    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape" && menu.classList.contains("is-open")) {
        setOpen(false);
        toggle.focus();
      }
    });

    window.matchMedia("(min-width: 861px)").addEventListener("change", (e) => {
      if (e.matches) setOpen(false);
    });

    const current = location.pathname.split("/").pop() || "index.html";
    $$(".nav-links a").forEach((link) => {
      if (link.getAttribute("href") === current) link.setAttribute("aria-current", "page");
    });
  }

  function renderAuthActions() {
    const wrap = $("[data-auth-actions]");
    const session = getSession();
    if (!wrap || !session) return;

    const firstName = session.name.split(" ")[0];
    wrap.innerHTML = `
      <span class="nav-user">Hi, ${escapeHtml(firstName)}</span>
      <button type="button" class="btn btn--dark" data-logout>Logout</button>
    `;

    $("[data-logout]", wrap).addEventListener("click", () => {
      store.remove(SESSION_KEY);
      showToast("You have been logged out");
      setTimeout(() => location.reload(), 700);
    });
  }

  function escapeHtml(str) {
    const div = document.createElement("div");
    div.textContent = str;
    return div.innerHTML;
  }

  function setFieldError(input, message) {
    const error = $(`#${input.id}-error`);
    input.setAttribute("aria-invalid", message ? "true" : "false");
    if (error) error.textContent = message;
  }

  function validateField(input) {
    const value = input.value.trim();
    let message = "";

    if (!value) {
      message = `${input.dataset.label} is required`;
    } else if (input.type === "email" && !EMAIL_RE.test(value)) {
      message = "Please enter a valid email address";
    } else if (input.name === "fullname" && value.length < 3) {
      message = "Name should be at least 3 characters";
    } else if (input.type === "password" && input.minLength > 0 && value.length < input.minLength) {
      message = `Password must be at least ${input.minLength} characters`;
    }

    setFieldError(input, message);
    return !message;
  }

  function redirectTarget() {
    const target = new URLSearchParams(location.search).get("redirect");
    return target && /^[\w-]+\.html$/.test(target) ? target : "courses.html";
  }

  function initAuthForm() {
    const form = $("[data-auth-form]");
    if (!form) return;

    if (getSession()) {
      location.replace(redirectTarget());
      return;
    }

    const inputs = $$("input", form);
    const msg = $(".form-msg", form);
    const mode = form.dataset.authForm;

    inputs.forEach((input) => {
      input.addEventListener("blur", () => input.value && validateField(input));
      input.addEventListener("input", () => {
        if (input.getAttribute("aria-invalid") === "true") validateField(input);
      });
    });

    form.addEventListener("submit", (e) => {
      e.preventDefault();
      msg.textContent = "";
      msg.className = "form-msg";

      const valid = inputs.map(validateField).every(Boolean);
      if (!valid) {
        inputs.find((i) => i.getAttribute("aria-invalid") === "true")?.focus();
        return;
      }

      const data = Object.fromEntries(new FormData(form));
      const email = data.email.trim().toLowerCase();

      if (mode === "signup") {
        if (findUser(email)) {
          setFieldError(form.email, "An account with this email already exists");
          form.email.focus();
          return;
        }
        const user = { name: data.fullname.trim(), email, password: data.password };
        store.set(USERS_KEY, [...getUsers(), user]);
        store.set(SESSION_KEY, { name: user.name, email });
      } else {
        const user = findUser(email);
        if (!user || user.password !== data.password) {
          msg.textContent = "Incorrect email or password";
          msg.classList.add("is-error");
          return;
        }
        store.set(SESSION_KEY, { name: user.name, email });
      }

      msg.textContent = mode === "signup" ? "Account created! Redirecting..." : "Welcome back! Redirecting...";
      msg.classList.add("is-success");
      form.querySelector("[type=submit]").disabled = true;
      setTimeout(() => location.assign(redirectTarget()), 900);
    });
  }

  function initSubscribe() {
    const form = $("[data-subscribe]");
    if (!form) return;
    const msg = form.nextElementSibling;

    form.addEventListener("submit", (e) => {
      e.preventDefault();
      const email = form.email.value.trim();
      msg.className = "form-msg";

      if (!EMAIL_RE.test(email)) {
        msg.textContent = "Please enter a valid email address";
        msg.classList.add("is-error");
        form.email.focus();
        return;
      }

      msg.textContent = "Thanks for subscribing! Check your inbox soon.";
      msg.classList.add("is-success");
      form.reset();
    });
  }

  const COURSES = [
    { id: "html-css", title: "HTML & CSS from Scratch", category: "web", lessons: 32, hours: 14, price: 799 },
    { id: "js-pro", title: "Modern JavaScript Bootcamp", category: "web", lessons: 48, hours: 22, price: 1299 },
    { id: "react", title: "React for Beginners", category: "web", lessons: 40, hours: 18, price: 1199 },
    { id: "python-ds", title: "Python for Data Science", category: "data", lessons: 36, hours: 16, price: 999 },
    { id: "ml-basics", title: "Machine Learning Essentials", category: "data", lessons: 44, hours: 24, price: 1499 },
    { id: "sql-analytics", title: "SQL & Data Analytics", category: "data", lessons: 28, hours: 11, price: 699 },
    { id: "flutter", title: "Flutter App Development", category: "app", lessons: 42, hours: 20, price: 1299 },
    { id: "android", title: "Android with Kotlin", category: "app", lessons: 38, hours: 19, price: 1199 },
    { id: "react-native", title: "React Native Masterclass", category: "app", lessons: 35, hours: 17, price: 1099 },
  ];

  const CATEGORY_LABELS = { web: "Web Development", data: "Data Science", app: "App Development" };

  const CATEGORY_ICONS = {
    web: '<path d="M64 96c0-35.3 28.7-64 64-64H512c35.3 0 64 28.7 64 64V352H512V96H128V352H64V96zM0 403.2C0 392.6 8.6 384 19.2 384H620.8c10.6 0 19.2 8.6 19.2 19.2c0 42.4-34.4 76.8-76.8 76.8H76.8C34.4 480 0 445.6 0 403.2zM281 209l-31 31 31 31c9.4 9.4 9.4 24.6 0 33.9s-24.6 9.4-33.9 0l-48-48c-9.4-9.4-9.4-24.6 0-33.9l48-48c9.4-9.4 24.6-9.4 33.9 0s9.4 24.6 0 33.9zM393 175l48 48c9.4 9.4 9.4 24.6 0 33.9l-48 48c-9.4 9.4-24.6 9.4-33.9 0s-9.4-24.6 0-33.9l31-31-31-31c-9.4-9.4-9.4-24.6 0-33.9s24.6-9.4 33.9 0z"/>',
    data: '<path d="M64 64c0-17.7-14.3-32-32-32S0 46.3 0 64V400c0 44.2 35.8 80 80 80H480c17.7 0 32-14.3 32-32s-14.3-32-32-32H80c-8.8 0-16-7.2-16-16V64zm406.6 86.6c12.5-12.5 12.5-32.8 0-45.3s-32.8-12.5-45.3 0L320 210.7l-57.4-57.4c-12.5-12.5-32.8-12.5-45.3 0l-112 112c-12.5 12.5-12.5 32.8 0 45.3s32.8 12.5 45.3 0L240 221.3l57.4 57.4c12.5 12.5 32.8 12.5 45.3 0l128-128z"/>',
    app: '<path d="M16 64C16 28.7 44.7 0 80 0H304c35.3 0 64 28.7 64 64V448c0 35.3-28.7 64-64 64H80c-35.3 0-64-28.7-64-64V64zM224 448a32 32 0 1 0 -64 0 32 32 0 1 0 64 0zM304 64H80V384H304V64z"/>',
  };

  const ICON_VIEWBOX = { web: "0 0 640 512", data: "0 0 512 512", app: "0 0 384 512" };

  function initCourses() {
    const grid = $("[data-courses]");
    if (!grid) return;

    const filterButtons = $$(".filters button");
    const priceFormat = new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 });
    const params = new URLSearchParams(location.search);
    let active = CATEGORY_LABELS[params.get("category")] ? params.get("category") : "all";

    const enrolledFor = () => {
      const session = getSession();
      return session ? store.get(ENROLL_KEY, {})[session.email] || [] : [];
    };

    function cardTemplate(course, enrolled) {
      const isEnrolled = enrolled.includes(course.id);
      return `
        <article class="course-card">
          <div class="course-card__thumb" aria-hidden="true">
            <svg class="icon" viewBox="${ICON_VIEWBOX[course.category]}">${CATEGORY_ICONS[course.category]}</svg>
          </div>
          <p class="course-card__tag">${CATEGORY_LABELS[course.category]}</p>
          <h3>${course.title}</h3>
          <p class="course-card__meta">
            <span>${course.lessons} lessons</span>
            <span>${course.hours} hrs</span>
          </p>
          <div class="course-card__footer">
            <span class="course-card__price">${priceFormat.format(course.price)}</span>
            <button type="button" class="btn btn--primary btn--sm${isEnrolled ? " is-enrolled" : ""}" data-enroll="${course.id}" aria-pressed="${isEnrolled}">
              ${isEnrolled ? "Enrolled" : "Enroll Now"}
            </button>
          </div>
        </article>
      `;
    }

    function render() {
      const list = active === "all" ? COURSES : COURSES.filter((c) => c.category === active);
      const enrolled = enrolledFor();
      grid.innerHTML = list.length
        ? list.map((c) => cardTemplate(c, enrolled)).join("")
        : '<p class="courses__empty">No courses found in this category yet.</p>';

      filterButtons.forEach((btn) => btn.setAttribute("aria-pressed", String(btn.dataset.filter === active)));
    }

    filterButtons.forEach((btn) => {
      btn.addEventListener("click", () => {
        active = btn.dataset.filter;
        const url = new URL(location.href);
        if (active === "all") url.searchParams.delete("category");
        else url.searchParams.set("category", active);
        history.replaceState(null, "", url);
        render();
      });
    });

    grid.addEventListener("click", (e) => {
      const btn = e.target.closest("[data-enroll]");
      if (!btn) return;

      const session = getSession();
      if (!session) {
        showToast("Please login to enroll in a course");
        setTimeout(() => location.assign("login.html?redirect=courses.html"), 1100);
        return;
      }

      const all = store.get(ENROLL_KEY, {});
      const mine = new Set(all[session.email] || []);
      const id = btn.dataset.enroll;
      const course = COURSES.find((c) => c.id === id);

      if (mine.has(id)) {
        mine.delete(id);
        showToast(`Removed "${course.title}" from your courses`);
      } else {
        mine.add(id);
        showToast(`You're enrolled in "${course.title}"`);
      }

      all[session.email] = [...mine];
      store.set(ENROLL_KEY, all);
      render();
    });

    render();
  }

  document.addEventListener("DOMContentLoaded", () => {
    $$("[data-year]").forEach((el) => (el.textContent = new Date().getFullYear()));
    initNav();
    renderAuthActions();
    initAuthForm();
    initSubscribe();
    initCourses();
  });
})();
