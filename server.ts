import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, Type } from "@google/genai";
import dotenv from "dotenv";
import { synthesize3DGame } from "./server/gameSynthesizer";

dotenv.config();

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json({ limit: "50mb" }));
  app.use(express.urlencoded({ limit: "50mb", extended: true }));

  app.get("/api/health", (req, res) => {
    res.json({ status: "ok", hasApiKey: Boolean(process.env.GEMINI_API_KEY) });
  });

  // API endpoint to generate code
  app.post("/api/generate", async (req, res) => {
    const { prompt, currentCode, customCode, engine, errorContext, uploadedImage, userApiKey: bodyKey } = req.body;
    const headerKey = req.headers["x-gemini-api-key"] as string;
    const activeKey = headerKey || bodyKey || process.env.GEMINI_API_KEY;

    if (!activeKey) {
      // Instant high-craft 3D game engine synthesis
      const synthesized = synthesize3DGame(prompt || "لعبة ثلاثية الأبعاد", uploadedImage);
      return res.json(synthesized);
    }

    try {
      const client = new GoogleGenAI({
        apiKey: activeKey,
        httpOptions: {
          headers: {
            "User-Agent": "aistudio-build",
          },
        },
      });

      let engineInstructions = `
CRITICAL MASTER INSTRUCTIONS FOR PRETEX 360 (بريتكس 360) - ALL APPLICATIONS & HEAVY 3D GAMES:
- You are PRETEX 360 (بريتكس 360): The Ultimate AI Engine for building ANY Web Application or Heavy AAA 3D Game:
  * Heavy AAA 3D Tactical Combat, Special Forces Battles with real weapons, health systems, ammo, enemy AI soldiers, recoil, muzzle flash, and sound effects.
  * Supercar Racing & Drift Physics: Aerodynamic models, tire smoke, engine audio, drifting mechanics, speedometers, open tracks.
  * Interactive 3D Open Worlds: Cities, markets, desert outposts, restaurants, cafes with civilians, animated pedestrians, neon signs, atmospheric lighting.
  * Web Applications: Product Showrooms, 3D Stores, Interactive Dashboards, Calculators, Educational Simulators, and Business Tools.
- ABSOLUTE PROHIBITION ON BLACK SCREENS ("الشاشة السمرة"):
  1. ALWAYS include complete lighting: THREE.AmbientLight(0xffffff, 0.9), THREE.DirectionalLight(0xffffff, 1.4) positioned high at (20, 40, 20), and THREE.HemisphereLight(0x818cf8, 0x1e293b, 0.6).
  2. ALWAYS set scene.background to a vibrant sky/daylight/scenic color (e.g. 0x1e293b, 0x0f172a, or dynamic sky gradient), NEVER empty pitch black.
  3. ALWAYS position camera at a safe viewpoint e.g. camera.position.set(0, 5, 12) and call camera.lookAt(0, 1, 0) so the camera is NEVER stuck inside a solid black mesh.
  4. Use standard CDN Three.js: <script src="https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js"></script>.
  5. Provide complete, bug-free, self-contained HTML + JS with Web Audio API sound effects and full controls (WASD + Mouse + Onscreen touch controls).
- INTERACTIVE QUESTIONS ("هل تريد إضافة...؟"):
  Generate 3 to 4 exciting, clickable feature questions in 'suggestedFeatures' asking the user if they want specific enhancements (e.g. "هل تريد إضافة مراحل قتال وأعداء إضافيين؟", "هل تريد إضافة متجر لترقية الأسلحة؟", "هل تريد إضافة وضع القيادة الليلية مع أضواء نيون؟").
`;

      let fullPrompt = `You are PRETEX 360 (بريتكس 360) - The Premier Master Application & 3D Game Architect.
${engineInstructions}

CRITICAL USER REQUEST: "${prompt}".
Build the complete, rich, standalone HTML application/game matching this exact request without cutting corners or omitting mechanics.
`;

      let contentsPayload: any = fullPrompt;

      if (uploadedImage && typeof uploadedImage === "string" && uploadedImage.startsWith("data:")) {
        const matches = uploadedImage.match(/^data:(image\/[a-zA-Z0-9+.-]+);base64,(.+)$/);
        if (matches) {
          const mimeType = matches[1];
          const base64Data = matches[2];

          fullPrompt += `
CRITICAL ATTACHED USER IMAGE:
The user has attached an image that you can see! Incorporate this visual element directly into the 3D scene (e.g., as a prominent 3D billboard, building storefront logo, framed exhibition piece, texture, or character prop).
IMPORTANT FOR THREE.JS CODE:
Do NOT output the raw base64 string inside your HTML. The backend will inject the image variable automatically into the HTML. In your Three.js script, load it like this:
\`\`\`javascript
if (window.USER_UPLOADED_IMAGE_DATA) {
  const customTex = new THREE.TextureLoader().load(window.USER_UPLOADED_IMAGE_DATA);
  const billboardMat = new THREE.MeshStandardMaterial({ map: customTex, roughness: 0.3 });
  const billboard = new THREE.Mesh(new THREE.PlaneGeometry(8, 5), billboardMat);
  billboard.position.set(0, 4.5, -8);
  scene.add(billboard);
  const frame = new THREE.Mesh(new THREE.BoxGeometry(8.4, 5.4, 0.2), new THREE.MeshStandardMaterial({ color: 0x1e293b, metalness: 0.8 }));
  frame.position.set(0, 4.5, -8.1);
  scene.add(frame);
}
\`\`\`
`;
          contentsPayload = [
            { text: fullPrompt },
            {
              inlineData: {
                mimeType,
                data: base64Data,
              },
            },
          ];
        } else {
          contentsPayload = fullPrompt;
        }
      }

      if (customCode) {
        fullPrompt += `\nThe user also provided their own code to incorporate, optimize, or upgrade:\n\`\`\`html\n${customCode}\n\`\`\`\nEnhance this code, fix any bugs, upgrade graphics and mechanics, and output the complete upgraded HTML.\n`;
        if (Array.isArray(contentsPayload)) {
          contentsPayload[0] = { text: fullPrompt };
        } else {
          contentsPayload = fullPrompt;
        }
      }

      if (currentCode) {
        fullPrompt += `\nHere is the existing code already running in the app:\n\`\`\`html\n${currentCode}\n\`\`\`\nUpdate or add requested features to this existing code without breaking what's already working.\n`;
        if (Array.isArray(contentsPayload)) {
          contentsPayload[0] = { text: fullPrompt };
        } else {
          contentsPayload = fullPrompt;
        }
      }
      
      if (errorContext) {
        fullPrompt += `\nThe user reported an error or bug in the previous version:\n${errorContext}\nFix the bug cleanly and return the corrected, complete HTML.\n`;
        if (Array.isArray(contentsPayload)) {
          contentsPayload[0] = { text: fullPrompt };
        } else {
          contentsPayload = fullPrompt;
        }
      }

      const CANDIDATE_MODELS = [
        "gemini-3.8-flash",
        "gemini-3.1-pro-preview",
        "gemini-flash-latest",
        "gemini-3.1-flash-lite",
      ];

      let lastError: any = null;
      let result: any = null;

      for (const candidateModel of CANDIDATE_MODELS) {
        try {
          const response = await client.models.generateContent({
            model: candidateModel,
            contents: contentsPayload,
            config: {
              responseMimeType: "application/json",
              responseSchema: {
                type: Type.OBJECT,
                properties: {
                  title: {
                    type: Type.STRING,
                    description: "A short, descriptive Arabic or English title for the game or app",
                  },
                  thoughtSteps: {
                    type: Type.ARRAY,
                    items: { type: Type.STRING },
                    description: "3 to 5 realistic planning and analytical thought steps in Arabic showing how the AI broke down and conceptualized the user's idea before programming.",
                  },
                  html: {
                    type: Type.STRING,
                    description: "The complete, standalone HTML document including embedded Three.js / JS / CSS scripts.",
                  },
                  explanation: {
                    type: Type.STRING,
                    description: "A friendly, detailed explanation in Arabic explaining the mechanics, controls, and features built.",
                  },
                  suggestedFeatures: {
                    type: Type.ARRAY,
                    items: { type: Type.STRING },
                    description: "3 to 4 interactive questions in Arabic asking 'هل تريد إضافة...' offering exciting next features to build.",
                  }
                },
                required: ["title", "thoughtSteps", "html", "explanation"]
              },
              systemInstruction: "You are PRETEX 360 (بريتكس 360) - Elite Master Game and Application Architect. Always provide realistic thought steps in thoughtSteps, complete production-ready single-file HTML code with rich visuals and audio, and 3-4 interactive questions in 'suggestedFeatures' starting with 'هل تريد إضافة...'. Always return a JSON object with 'title', 'thoughtSteps', 'html', 'explanation', and 'suggestedFeatures'."
            }
          });

          const responseText = response.text || "{}";
          result = JSON.parse(responseText);
          if (result && result.html) {
            break; // Success! Break loop.
          }
        } catch (modelErr: any) {
          console.warn(`Model ${candidateModel} failed:`, modelErr.message || modelErr);
          lastError = modelErr;
        }
      }

      if (!result || !result.html) {
        console.warn("AI models could not generate, using built-in 3D game engine for:", prompt);
        result = synthesize3DGame(prompt || "تطبيق تفاعلي ثلاثي الأبعاد", uploadedImage);
      }

      // Default suggested questions if empty
      if (!result.suggestedFeatures || !Array.isArray(result.suggestedFeatures) || result.suggestedFeatures.length === 0) {
        result.suggestedFeatures = [
          "هل تريد إضافة مراحل إضافية ومستوى صعوبة أعلى؟",
          "هل تريد إضافة ترسانة أسلحة ومؤثرات صوتية هائلة؟",
          "هل تريد إضافة مركبات وسيارات تفحيط وانجراف Drift؟",
          "هل تريد إضافة نظام لوحة المتصدرين وحفظ أعلى النقاط؟"
        ];
      }

      // Anti-Black-Screen Shield & Asset Injection
      if (result && result.html) {
        const shieldScript = `
<script>
/* PRETEX 360 Anti-Black-Screen Shield */
(function() {
  window.addEventListener('error', function(e) {
    console.warn('[Pretex 360 Shield] Intercepted notice:', e.message);
  });
  // Verify body background is never pitch black without elements
  document.addEventListener('DOMContentLoaded', function() {
    if (document.body && (!document.body.style.backgroundColor || document.body.style.backgroundColor === 'black')) {
      document.body.style.backgroundColor = '#0b0f19';
    }
  });
})();
</script>`;

        let injection = shieldScript;
        if (uploadedImage) {
          injection += `\n<script>window.USER_UPLOADED_IMAGE_DATA = ${JSON.stringify(uploadedImage)};</script>`;
        }

        if (result.html.includes("<head>")) {
          result.html = result.html.replace("<head>", `<head>\n  ${injection}`);
        } else {
          result.html = `${injection}\n${result.html}`;
        }
      }

      res.json(result);
    } catch (error: any) {
      console.warn("Gemini API Error, falling back to 3D Game Synthesizer:", error?.message || error);
      try {
        const fallback = synthesize3DGame(req.body?.prompt || "لعبة ثلاثية الأبعاد", req.body?.uploadedImage);
        return res.json(fallback);
      } catch (fbErr: any) {
        console.error("Synthesizer error:", fbErr);
        const ultraFallback = synthesize3DGame("لعبة تكتيكية 3D");
        return res.json(ultraFallback);
      }
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
