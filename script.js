const chat = document.getElementById("chat");
const input = document.getElementById("input");
const button = document.getElementById("button");

const appendMessage = (message, sender, imageSrc = null) => {
  const messageDiv = document.createElement("div");
  messageDiv.classList.add("message", sender);

  const avatarDiv = document.createElement("div");
  avatarDiv.classList.add("avatar");

  const contentContainer = document.createElement("div");
  contentContainer.classList.add("content-container");

  if (imageSrc) {
    const imageElement = document.createElement("img");
    imageElement.classList.add("chat-image");
    imageElement.src = imageSrc;
    contentContainer.appendChild(imageElement);
  }

  const textDiv = document.createElement("div");
  textDiv.classList.add("text-content");
  textDiv.textContent = message;

  contentContainer.appendChild(textDiv);
  messageDiv.appendChild(avatarDiv);
  messageDiv.appendChild(contentContainer);
  
  chat.appendChild(messageDiv);
  chat.scrollTop = chat.scrollHeight;
};

const fetchWikipediaData = async (query) => {
  const searchUrl = `https://en.wikipedia.org/w/api.php?action=query&list=search&format=json&srsearch=${encodeURIComponent(query)}&origin=*`;
  try {
    const searchResponse = await fetch(searchUrl);
    const searchData = await searchResponse.json();
    
    if (searchData.query.search.length === 0) {
      return { text: "Sorry, I couldn't find any information on that topic.", image: null };
    }
    
    const title = searchData.query.search[0].title;
    const pageUrl = `https://en.wikipedia.org/w/api.php?action=query&format=json&prop=extracts|pageimages&titles=${encodeURIComponent(title)}&exintro=true&explaintext=true&pithumbsize=400&origin=*`;
    const pageResponse = await fetch(pageUrl);
    const pageData = await pageResponse.json();
    const pages = pageData.query.pages;
    const pageId = Object.keys(pages)[0];

    if (pageId === "-1") {
      return { text: "Sorry, I couldn't retrieve the detailed information.", image: null };
    }

    const extract = pages[pageId].extract || "No additional information available.";
    const image = pages[pageId].thumbnail ? pages[pageId].thumbnail.source : null;

    return { text: extract, image };
  } catch (error) {
    return { text: "Check Your Internet", image: null };
  }
};

const handleUserMessage = async () => {
  const userInput = input.value.trim();
  if (!userInput) return;

  appendMessage(userInput, "user");
  input.value = "";

  const lowerCaseInput = userInput.toLowerCase();

  // Check if user says "hello" or "hi"
  if (lowerCaseInput === "hello" || lowerCaseInput === "hi") {
    appendMessage("¡Hola Kunal! Soy tu asistente personal. ¿Cómo puedo ayudarte?", "bot");
    return;
  }

  // Fetch Wikipedia Data for other queries
  const { text, image } = await fetchWikipediaData(userInput);
  appendMessage(text, "bot", image);
};

button.addEventListener("click", handleUserMessage);

input.addEventListener("keypress", (event) => {
  if (event.key === "Enter") {
    handleUserMessage();
  }
});
