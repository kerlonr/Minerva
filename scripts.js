// Configurar marked com opções personalizadas
marked.setOptions({
  breaks: true, // Quebras de linha viram <br>
  gfm: true, // Suporte a GitHub Flavored Markdown
  highlight: function (code, lang) {
    if (lang && hljs.getLanguage(lang)) {
      try {
        return hljs.highlight(code, { language: lang }).value;
      } catch (err) {
        console.error("Erro ao destacar código:", err);
      }
    }
    return code;
  },
});

// Função para criar estrelas animadas
function createStars() {
  const container = document.getElementById("starsContainer");
  const starCount = 80;

  for (let i = 0; i < starCount; i++) {
    const star = document.createElement("div");
    star.className = "star";

    const size = Math.random() * 2 + 1;
    star.style.width = `${size}px`;
    star.style.height = `${size}px`;
    star.style.left = `${Math.random() * 100}%`;
    star.style.opacity = Math.random() * 0.4 + 0.3;

    const duration = Math.random() * 15 + 15;
    const delay = Math.random() * 10;

    star.style.animationDuration = `${duration}s`;
    star.style.animationDelay = `${delay}s`;

    container.appendChild(star);
  }

  const extraStars = 30;
  for (let i = 0; i < extraStars; i++) {
    const star = document.createElement("div");
    star.className = "star";

    const size = Math.random() * 1.5 + 0.5;
    star.style.width = `${size}px`;
    star.style.height = `${size}px`;
    star.style.left = `${Math.random() * 100}%`;
    star.style.opacity = Math.random() * 0.3 + 0.1;

    const duration = Math.random() * 20 + 25;
    const delay = Math.random() * 15;

    star.style.animationDuration = `${duration}s`;
    star.style.animationDelay = `${delay}s`;

    container.appendChild(star);
  }
}

// Função para sanitizar HTML (proteção básica contra XSS)
function sanitizeHTML(html) {
  const temp = document.createElement("div");
  temp.textContent = html;
  return temp.innerHTML;
}

document.addEventListener("DOMContentLoaded", () => {
  // Criar as estrelas
  createStars();

  const OLLAMA_API_URL = "https://llama.kerlonr.com.br";
  const initialState = document.getElementById("initialState");
  const chatState = document.getElementById("chatState");
  const chatContainer = document.getElementById("chatContainer");
  const statusMessage = document.getElementById("statusMessage");
  const modelSelector = document.getElementById("modelSelector");

  let chatStarted = false;

  const elements = {
    initial: {
      input: document.getElementById("initialInput"),
      button: document.getElementById("initialSendButton"),
    },
    chat: {
      input: document.getElementById("chatInput"),
      button: document.getElementById("sendButton"),
    },
  };

  function autoResize(textarea) {
    textarea.style.height = "auto";
    textarea.style.height = Math.min(textarea.scrollHeight, 120) + "px";
  }

  function startChat() {
    if (chatStarted) return;

    initialState.classList.add("hidden");
    setTimeout(() => chatState.classList.add("visible"), 100);
    elements.chat.input.focus();
    chatStarted = true;
  }

  function addMessage(text, isUser = false) {
    const messageDiv = document.createElement("div");
    messageDiv.className = `message ${isUser ? "user-message" : "ai-message"}`;
    messageDiv.style.animation = "slideUp 0.2s ease-out";

    const contentDiv = document.createElement("div");
    contentDiv.className = "message-content";

    if (!isUser) {
      // Para mensagens da IA: renderizar markdown
      try {
        // Usar marked para converter markdown em HTML
        const html = marked.parse(text);
        contentDiv.innerHTML = html;

        // Aplicar highlight.js a blocos de código
        contentDiv.querySelectorAll("pre code").forEach((block) => {
          hljs.highlightElement(block);
        });
      } catch (error) {
        console.error("Erro ao processar markdown:", error);
        contentDiv.textContent = text;
      }
    } else {
      // Para mensagens do usuário: apenas texto (sem markdown)
      contentDiv.textContent = text;
    }

    // Aplicar backdrop-filter via JavaScript
    contentDiv.style.backdropFilter = "blur(10px)";
    contentDiv.style.webkitBackdropFilter = "blur(10px)";
    contentDiv.style.backgroundColor = isUser
      ? "rgba(30, 100, 200, 0.15)"
      : "rgba(255, 255, 255, 0.05)";

    messageDiv.appendChild(contentDiv);
    chatContainer.appendChild(messageDiv);
    chatContainer.scrollTop = chatContainer.scrollHeight;
  }

  function showTypingIndicator() {
    const typingDiv = document.createElement("div");
    typingDiv.className = "typing-indicator";
    typingDiv.id = "typingIndicator";

    const dotsDiv = document.createElement("div");
    dotsDiv.className = "typing-dots";
    dotsDiv.innerHTML = "<span></span><span></span><span></span>";

    typingDiv.appendChild(dotsDiv);
    chatContainer.appendChild(typingDiv);

    // aplica o blur
    typingDiv.style.backdropFilter = "blur(10px)";
    typingDiv.style.webkitBackdropFilter = "blur(10px)";
    typingDiv.style.backgroundColor = "rgba(255, 255, 255, 0.03)";

    chatContainer.scrollTop = chatContainer.scrollHeight;
  }

  function removeTypingIndicator() {
    document.getElementById("typingIndicator")?.remove();
  }

  async function testConnection() {
    try {
      const response = await fetch(`${OLLAMA_API_URL}/api/tags`);
      if (response.ok) {
        const data = await response.json();
        statusMessage.textContent = `Conectado ao Ollama | ${
          data.models?.length || 0
        } modelos disponíveis`;
        return true;
      }
    } catch (error) {
      statusMessage.textContent = "Não foi possível conectar ao Ollama";
    }
    return false;
  }

  async function getAIResponse(userMessage) {
    statusMessage.textContent = `Processando com ${modelSelector.value}...`;
    showTypingIndicator();

    try {
      const payload = {
        model: modelSelector.value,
        prompt: userMessage,
        stream: false,
        options: { temperature: 0.7, top_p: 0.9, top_k: 40, num_predict: 512 },
      };

      const response = await fetch(`${OLLAMA_API_URL}/api/generate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!response.ok) throw new Error(`Erro ${response.status}`);

      const data = await response.json();
      statusMessage.textContent = `Resposta recebida de ${modelSelector.value}`;
      return data.response || "Desculpe, não recebi uma resposta válida.";
    } catch (error) {
      statusMessage.textContent = "Erro na conexão";
      return "Desculpe, ocorreu um erro ao processar sua mensagem.";
    } finally {
      removeTypingIndicator();
    }
  }

  async function handleSend(message, isInitial = false) {
    if (!message.trim()) return;

    if (isInitial) {
      startChat();
      setTimeout(() => addMessage(message, true), 300);
      elements.initial.input.value = "";
    } else {
      addMessage(message, true);
      elements.chat.input.value = "";
      elements.chat.button.disabled = true;
    }

    const response = await getAIResponse(message);
    addMessage(response, false);

    if (!isInitial) {
      elements.chat.button.disabled = false;
      elements.chat.input.focus();
    }
  }

  function setupEventListeners(inputElement, buttonElement, isInitial = false) {
    inputElement.addEventListener("input", () => autoResize(inputElement));
    buttonElement.addEventListener("click", () =>
      handleSend(inputElement.value, isInitial)
    );

    inputElement.addEventListener("keydown", (e) => {
      if (e.key === "Enter" && !e.shiftKey) {
        e.preventDefault();
        handleSend(inputElement.value, isInitial);
      }
    });
  }

  // Aplicar backdrop-filter aos elementos existentes
  const applyBackdropFilter = () => {
    // Aplicar ao header
    const header = document.querySelector(".header");
    if (header) {
      header.style.backdropFilter = "blur(10px)";
      header.style.webkitBackdropFilter = "blur(10px)";
    }

    // Aplicar ao input-container
    const inputContainer = document.querySelector(".input-container");
    if (inputContainer) {
      inputContainer.style.backdropFilter = "blur(10px)";
      inputContainer.style.webkitBackdropFilter = "blur(10px)";
    }

    // Aplicar ao status-message
    const statusMsg = document.querySelector(".status-message");
    if (statusMsg) {
      statusMsg.style.backdropFilter = "blur(10px)";
      statusMsg.style.webkitBackdropFilter = "blur(10px)";
    }

    // Aplicar ao initial-state
    const initialStateEl = document.querySelector(".initial-state");
    if (initialStateEl) {
      initialStateEl.style.backdropFilter = "blur(10px)";
      initialStateEl.style.webkitBackdropFilter = "blur(10px)";
    }

    // Aplicar ao input-box
    document.querySelectorAll(".input-box").forEach((input) => {
      input.style.backdropFilter = "blur(10px)";
      input.style.webkitBackdropFilter = "blur(10px)";
    });
  };

  setupEventListeners(elements.initial.input, elements.initial.button, true);
  setupEventListeners(elements.chat.input, elements.chat.button, false);
  modelSelector.addEventListener("change", testConnection);

  testConnection();
  elements.initial.input.focus();

  // Aguardar um pouco para garantir que o DOM esteja totalmente carregado
  setTimeout(applyBackdropFilter, 100);
});
