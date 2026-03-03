import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { GoogleGenAI, Type } from "npm:@google/genai@1.43.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

interface AnalysisRequest {
  gameMode: number;
  playersText: string;
  extraInfo: string;
  analysisMode: "deep" | "fast";
}

interface AnalysisResult {
  structure: string;
  positions: string;
  roles: string;
  offense: string;
  defense: string;
  possession: string;
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, {
      status: 200,
      headers: corsHeaders,
    });
  }

  try {
    const body: AnalysisRequest = await req.json();
    const { gameMode, playersText, extraInfo, analysisMode } = body;

    const apiKey = Deno.env.get("GEMINI_API_KEY");
    if (!apiKey) {
      throw new Error("GEMINI_API_KEY is not configured");
    }

    const ai = new GoogleGenAI({ apiKey });

    const extraInfoSection = extraInfo.trim()
      ? `\n\n额外补充信息（请务必结合以下信息进行分析）：\n${extraInfo.trim()}\n`
      : "";

    const prompt = `作为顶级的篮球战术分析师，请根据以下${gameMode}名首发球员的能力值（单项满分10分），为我们的班级篮球赛（${gameMode}V${gameMode}模式）制定全场战术分析。

球员名单及能力值：
${playersText}${extraInfoSection}

请从以下6个方面进行详细、专业、富有洞察力的本质分析。请务必深入挖掘球员属性之间的化学反应，并紧密结合${gameMode}V${gameMode}的比赛特点。
【排版要求】：
1. 必须使用纯正的Markdown格式，绝对不要使用 HTML 标签（如 <br>、<b> 等）。
2. 每个维度请严格分为以下三个段落，并且每个段落之间必须空一行（使用两个换行符）：

### 核心观点
（一句话总结该维度的核心策略）

### 详细解析
（深入挖掘球员属性之间的化学反应，分析具体原因）

### 关键执行点
- （执行点1）
- （执行点2）
- （执行点3）

3. 语言要专业、热血、富有科技感。
4. 无论在任何模式下，都必须严格遵守上述格式，确保段落之间有明显的换行和间距。`;

    const modelName =
      analysisMode === "deep" ? "gemini-3.1-pro-preview" : "gemini-2.5-flash";

    const response = await ai.models.generateContent({
      model: modelName,
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            structure: {
              type: Type.STRING,
              description:
                "阵容结构 (分析这套阵容的整体特点、优势与劣势)",
            },
            positions: {
              type: Type.STRING,
              description: "位置分配 (为这5名球员分配最合适的场上位置1号位到5号位)",
            },
            roles: {
              type: Type.STRING,
              description: "个人职责 (详细说明每个人在场上应该做什么，发挥什么作用)",
            },
            offense: {
              type: Type.STRING,
              description:
                "进攻体系 (推荐适合这套阵容的进攻战术，如挡拆、传切、快攻等)",
            },
            defense: {
              type: Type.STRING,
              description:
                "防守体系 (推荐适合的防守策略，如盯人、2-3联防、3-2联防、全场紧逼等)",
            },
            possession: {
              type: Type.STRING,
              description:
                "球权分配 (明确核心主攻点、组织核心以及角色球员的球权占比)",
            },
          },
          required: [
            "structure",
            "positions",
            "roles",
            "offense",
            "defense",
            "possession",
          ],
        },
      },
    });

    const text = response.text;
    if (!text) {
      throw new Error("API返回数据为空，可能触发了安全限制。");
    }

    let cleanText = text.trim();
    if (cleanText.startsWith("```")) {
      cleanText = cleanText
        .replace(/^```(?:json)?\n?/, "")
        .replace(/\n?```$/, "")
        .trim();
    }

    const result: AnalysisResult = JSON.parse(cleanText);

    return new Response(JSON.stringify(result), {
      headers: {
        ...corsHeaders,
        "Content-Type": "application/json",
      },
    });
  } catch (error: unknown) {
    const message =
      error instanceof Error ? error.message : "Unknown error occurred";
    console.error("Analysis error:", message);

    return new Response(
      JSON.stringify({
        error: message,
      }),
      {
        status: 400,
        headers: {
          ...corsHeaders,
          "Content-Type": "application/json",
        },
      }
    );
  }
});
