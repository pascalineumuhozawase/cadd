function getMockResponse(message) {
  const text = message.toLowerCase();
  if (text.includes('rwanda') || text.includes('how many')) {
    return "In Rwanda, the main cassava diseases are Cassava Mosaic Disease (CMD), Cassava Brown Streak Disease (CBSD), Cassava Green Mottle (CGM), and Cassava Bacterial Blight (CBB). CMD and CBSD are the most common.";
  }
  if (text.includes('cbsd')) {
    return "CBSD causes yellow/brown streaks on leaves and brown rot in the roots. Uproot infected plants immediately.";
  }
  return "I am the CADD assistant. Please upload a leaf image to the Diagnose page for an accurate AI prediction, or ask me about CMD, CBSD, CBB, or CGM.";
}

export async function chat(req, res) {
  try {
    const { message } = req.body;

    if (typeof message !== "string" || !message.trim()) {
      return res.status(400).json({ message: "Message is required." });
    }

    res.json({ reply: getMockResponse(message.trim()) });
  } catch (error) {
    console.error("Chat error:", error);
    res.status(500).json({ message: "Server error" });
  }
}