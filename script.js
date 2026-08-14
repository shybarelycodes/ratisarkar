const toast = document.getElementById("toast");

function showToast(message = "copied!") {
  toast.textContent = message;
  toast.classList.add("show");

  clearTimeout(window.__toastTimer);
  window.__toastTimer = setTimeout(() => {
    toast.classList.remove("show");
  }, 1500);
}

document.querySelectorAll(".copy-code").forEach((button) => {
  button.addEventListener("click", async () => {
    const code = button.dataset.code;

    try {
      await navigator.clipboard.writeText(code);
      showToast(`${code} copied!`);
    } catch {
      const temp = document.createElement("textarea");
      temp.value = code;
      document.body.appendChild(temp);
      temp.select();
      document.execCommand("copy");
      temp.remove();
      showToast(`${code} copied!`);
    }
  });
});
