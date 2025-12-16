import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextResponse } from "next/server";
import { availableTools } from "@/libs/tools";
import { geminiTools } from "@/libs/gemini-tools";
import { logError } from "@/lib/logger";


export async function POST(req) {
  try {
    console.log("API: Received chat request");
    const body = await req.json();
    const { message, history } = body;

    if (!process.env.GOOGLE_API_KEY) {
      console.error("API Error: Missing GOOGLE_API_KEY");
      return NextResponse.json({ error: "API Key not configured" }, { status: 500 });
    }

    // Initialize Gemini
    console.log("API: Initializing Gemini...");
    const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY);
    const model = genAI.getGenerativeModel({ 
        model: "gemini-2.5-flash",
        tools: geminiTools,
    });

    // Start chat session with history
    // Gemini requires the first message in history to be from 'user'
    let validHistory = history.map((msg) => ({
        role: msg.role === "user" ? "user" : "model",
        parts: [{ text: msg.content || "" }],
      }));

    if (validHistory.length > 0 && validHistory[0].role !== 'user') {
        validHistory.shift(); // Remove the first message if it's not from user
    }

    const chat = model.startChat({
      history: validHistory,
    });

    // Send message to Gemini
    console.log(`API: Sending message: ${message}`);
    const result = await chat.sendMessage(message);
    const response = await result.response;
    
    // Check for function calls
    const functionCalls = response.functionCalls();
    console.log("API: Function calls detected:", functionCalls ? functionCalls.length : 0);

    if (functionCalls && functionCalls.length > 0) {
      // Execute the function call
      const call = functionCalls[0];
      const toolName = call.name;
      const args = call.args;
      console.log(`API: Executing tool: ${toolName} with args:`, args);

      if (availableTools[toolName]) {
        // Execute the tool logic
        const toolResult = await availableTools[toolName](args); // Ensure await for async tools

        // Send the result back to Gemini
        const result2 = await chat.sendMessage([
          {
            functionResponse: {
              name: toolName,
              response: {
                content: toolResult,
              },
            },
          },
        ]);

        // Get the final text response
        const finalResponse = await result2.response;
        return NextResponse.json({ 
            role: "model", 
            content: finalResponse.text() 
        });
      }
    }

    // Return normal text response
    return NextResponse.json({ 
        role: "model", 
        content: response.text() 
    });

  } catch (error) {
    console.error("Gemini API Error:", error);
    logError(error, "Gemini Chat API");
    return NextResponse.json(
      { error: "Erro ao processar mensagem. Verifique os logs." },
      { status: 500 }
    );
  }
}
