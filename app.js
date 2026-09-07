/* TL — Личный кабинет TL */

const tg = window.Telegram?.WebApp || null;

if (tg) {
    try {
        tg.ready();
        tg.expand();
        tg.setHeaderColor("#09090b");
        tg.setBackgroundColor("#09090b");
    } catch (error) {
        console.log("Telegram WebApp API:", error);
    }
}

const state = {
    user: {
        firstName: "Grety",
        username: "test_user"
    },
    subscription: {
        active: true,
        type: "free_trial",
        name: "Бесплатный период",
        daysLeft: 5
    },
    settings: {
        autoAccept: false,
        notifications: true
    },
    home: {
        activeWheels: 2,
        activePromos: 3
    }
};

function initializeUser() {
    const userName = document.getElementById("user-name");
    const userUsername = document.getElementById("user-username");
    const avatar = document.getElementById("user-avatar");

    let firstName = state.user.firstName;
    let username = state.user.username;

    if (tg?.initDataUnsafe?.user) {
        const user = tg.initDataUnsafe.user;
        firstName = user.first_name || firstName;
        username = user.username || username;
    }

    if (userName) userName.textContent = firstName;
    if (userUsername) userUsername.textContent = username ? `@${username}` : "Telegram";
    if (avatar) avatar.textContent = firstName.charAt(0).toUpperCase();
}

function initializeSettings() {
    const autoAccept = document.getElementById("autoAccept");
    const notifications = document.getElementById("notifications");

    if (autoAccept) autoAccept.checked = state.settings.autoAccept;
    if (notifications) notifications.checked = state.settings.notifications;
}

function initializeAccess() {
    const status = document.getElementById("access-status");
    const days = document.getElementById("access-days");
    const planLabel = document.getElementById("access-plan-label");
    const type = document.getElementById("access-type");
    const subscriptionName = document.getElementById("subscription-name");

    if (!state.subscription.active) {
        if (status) status.textContent = "Доступ не активен";
        if (days) days.textContent = "—";
        if (planLabel) planLabel.textContent = "Статус";
        if (type) type.textContent = "TL";
        if (subscriptionName) subscriptionName.textContent = "Подписка не активна";
        return;
    }

    if (state.subscription.type === "free_trial") {
        if (status) status.textContent = "Бесплатный период";
        if (days) days.textContent = `${state.subscription.daysLeft} дней`;
        if (planLabel) planLabel.textContent = "Осталось";
        if (subscriptionName) subscriptionName.textContent = "Бесплатный период";
    } else {
        if (status) status.textContent = "Подписка активна";
        if (days) days.textContent = `${state.subscription.daysLeft} дней`;
        if (planLabel) planLabel.textContent = "Осталось";
        if (subscriptionName) subscriptionName.textContent = state.subscription.name;
    }
}

function initializeHome() {
    const wheelsTitle = document.getElementById("home-wheels-title");
    const promosTitle = document.getElementById("home-promos-title");
    const wheelsIcon = document.querySelector("#home-wheels-status .item-icon");
    const promosIcon = document.querySelector("#home-promos-status .item-icon");

    const wheelsCount = Number(state.home.activeWheels) || 0;
    const promosCount = Number(state.home.activePromos) || 0;

    if (wheelsTitle) {
        wheelsTitle.textContent = wheelsCount > 0
            ? `Имеются активные колёса (${wheelsCount})`
            : "Активных колёс нет";
    }

    if (promosTitle) {
        promosTitle.textContent = promosCount > 0
            ? `Имеются активные акции (${promosCount})`
            : "Активных акций нет";
    }

    wheelsIcon?.classList.toggle("red-ring", wheelsCount > 0);
    wheelsIcon?.classList.toggle("inactive", wheelsCount === 0);
    promosIcon?.classList.toggle("red-ring", promosCount > 0);
    promosIcon?.classList.toggle("inactive", promosCount === 0);
}

function initializeNavigation() {
    document.querySelectorAll(".nav-item").forEach((button) => {
        button.addEventListener("click", () => navigate(button.dataset.page));
    });
}

function navigate(pageName) {
    const target = document.getElementById(`page-${pageName}`);
    if (!target) return;

    document.querySelectorAll(".page").forEach((page) => page.classList.remove("active"));
    document.querySelectorAll(".nav-item").forEach((button) => {
        button.classList.toggle("active", button.dataset.page === pageName);
    });

    target.classList.add("active");
    window.scrollTo({ top: 0, behavior: "smooth" });
}

function openHome() { navigate("home"); }
function openWheels() { navigate("wheels"); }
function openPromos() { navigate("promos"); }
function openSubscription() { navigate("subscription"); }
function openSettings() { navigate("settings"); }

function switchWheelTab(tab, button) {
    const active = document.getElementById("wheel-active");
    const history = document.getElementById("wheel-history");

    document.querySelectorAll(".tabs .tab").forEach((item) => item.classList.remove("active"));
    if (button) button.classList.add("active");

    if (tab === "active") {
        active?.classList.remove("hidden");
        history?.classList.add("hidden");
    } else {
        active?.classList.add("hidden");
        history?.classList.remove("hidden");
    }
}

function filterPromos(type, button) {
    document.querySelectorAll(".promo-filter").forEach((item) => item.classList.remove("active"));
    button?.classList.add("active");

    document.querySelectorAll(".promo-card").forEach((card) => {
        const show = type === "all" || card.dataset.type === type;
        card.style.display = show ? "block" : "none";
    });
}

function toggleAutoAccept() {
    const checkbox = document.getElementById("autoAccept");
    if (!checkbox) return;
    state.settings.autoAccept = checkbox.checked;

    const status = document.getElementById("bb-account-status");
    if (status && checkbox.checked) {
        status.textContent = "Не привязан · нужен для автопринятия";
    }
}

function openBetBoomAccount() {
    alert("Раздел привязки аккаунта BetBoom подключим на следующем этапе.");
}

function openPromo(id) {
    console.log("Open promo:", id);
}

function openChannel() {
    const channelUrl = "https://t.me/";
    if (tg?.openTelegramLink) {
        tg.openTelegramLink(channelUrl);
        return;
    }
    window.open(channelUrl, "_blank");
}

document.addEventListener("DOMContentLoaded", () => {
    initializeUser();
    initializeSettings();
    initializeAccess();
    initializeHome();
    initializeNavigation();
    console.log("TL — Личный кабинет запущен");
});

window.TL = {
    state,
    navigate,
    openHome,
    openWheels,
    openPromos,
    openSubscription,
    openSettings
};
