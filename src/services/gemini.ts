import { GoogleGenAI, Type } from "@google/genai";

const getAI = () => {
  // Use API_KEY for paid models (Veo, Gemini 3.1 Image), fallback to GEMINI_API_KEY
  const apiKey = process.env.API_KEY || process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error("API key is not defined. Please select an API key.");
  }
  return new GoogleGenAI({ apiKey });
};

export const generateText = async (prompt: string, type: 'marketing' | 'blog' | 'planning' | 'full_writing', files: { data: string, mimeType: string }[] = []) => {
  const ai = getAI();
  let systemInstruction = "";
  
  if (type === 'marketing') {
    systemInstruction = "당신은 마케팅 전문가입니다. 사용자의 요청에 맞춰 매력적이고 클릭을 유도하는 마케팅 문구를 작성하세요. 한국어로 답변하세요.";
  } else if (type === 'blog') {
    systemInstruction = "당신은 전문 블로거입니다. 사용자의 주제에 대해 깊이 있고 흥미로운 블로그 포스팅을 작성하세요. 한국어로 답변하세요.";
  } else if (type === 'planning') {
    systemInstruction = "당신은 전략 기획자입니다. 주제, 타겟 독자, 핵심 메시지를 바탕으로 체계적인 콘텐츠 기획안을 작성하세요. 목차와 주요 내용을 포함하세요. 한국어로 답변하세요.";
  } else if (type === 'full_writing') {
    systemInstruction = `당신은 콘텐츠 마케팅 전문가입니다. 
사용자가 제공한 주제, 타겟 독자, 핵심 메시지, 참고 링크 및 파일을 바탕으로 다음 두 가지를 모두 포함한 결과를 작성하세요:
1. [콘텐츠 기획안]: 전략적인 방향성, 목차 구성, 핵심 타겟 분석
2. [최종 제작물]: 기획안을 바탕으로 실제로 배포 가능한 수준의 고퀄리티 블로그/마케팅 본문

결과는 명확하게 '[기획안]' 섹션과 '[제작물]' 섹션으로 나누어 작성하세요. 한국어로 답변하세요.`;
  }

  const parts = [
    { text: prompt },
    ...files.map(f => ({
      inlineData: {
        data: f.data,
        mimeType: f.mimeType
      }
    }))
  ];

  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: { parts },
    config: {
      systemInstruction,
    },
  });

  return response.text;
};

export const generateImage = async (prompt: string, count: number = 1) => {
  const ai = getAI();
  
  // To ensure separate images, we make multiple parallel requests
  const tasks = Array.from({ length: count }).map((_, i) => 
    ai.models.generateContent({
      model: 'gemini-3.1-flash-image-preview',
      contents: {
        parts: [
          {
            text: `${prompt} (Variation ${i + 1})`,
          },
        ],
      },
      config: {
        imageConfig: {
          aspectRatio: "1:1",
          imageSize: "1K"
        }
      }
    })
  );

  const responses = await Promise.all(tasks);
  const images: string[] = [];
  
  for (const response of responses) {
    for (const part of response.candidates?.[0]?.content?.parts || []) {
      if (part.inlineData) {
        images.push(`data:image/png;base64,${part.inlineData.data}`);
      }
    }
  }
  
  return images.length > 0 ? images : null;
};

export const generateVideo = async (prompt: string, aspectRatio: '16:9' | '9:16' = '16:9', duration: number = 5, files: { data: string, mimeType: string }[] = []) => {
  const ai = getAI();
  
  // Step 1: Generate a detailed video scenario/prompt using Gemini Text
  const scenarioPrompt = `당신은 세계 최고의 영상 감독이자 브랜드 아이덴티티 전문가입니다. 사용자의 요청과 첨부된 파일 내용을 바탕으로 비디오 생성 AI(Veo)가 최상의 결과물을 낼 수 있도록 매우 상세하고 시각적인 영상 시나리오 프롬프트를 작성하세요. 

[절대 준수 사항 - 고도화 지침]
1. 브랜드 로고 및 아이덴티티 보존:
   - 첨부된 파일에 로고가 있다면, 그 형태와 색상을 절대 임의로 변경하지 마세요. 
   - 영상 내에서 로고가 나타날 때 "Original logo from the reference file must be preserved exactly without any modification"이라고 명시하세요.
   - 로고의 위치(예: 우측 상단, 중앙 등)를 고정하여 묘사하세요.

2. 텍스트 정확성 (Text Fidelity):
   - 사용자가 요청한 텍스트는 토씨 하나 틀리지 않고 정확하게 출력되어야 합니다.
   - 텍스트를 묘사할 때 "The text '[정확한 텍스트]' must appear clearly in [Font Style] font, centered, with high contrast"와 같이 매우 구체적으로 지시하세요.
   - 복잡한 문장보다는 핵심 키워드 위주로 배치하여 AI가 오타를 내지 않도록 유도하세요.

3. 시각적 일관성:
   - 첨부된 파일의 색감(Color Palette), 분위기(Mood), 질감을 영상 전체에 일관되게 적용하세요.
   - "Maintain the exact color grading and aesthetic of the attached reference image"라고 지시하세요.

4. 영상 구성:
   - 요청사항: ${prompt}
   - 영상 길이: 약 ${duration}초. 이 시간 내에 기승전결이 완벽하게 담기도록 샷(Shot) 구성을 세밀하게 나누어 설명하세요.

5. 출력 형식:
   - 시나리오는 영어로 작성하세요 (AI 모델 성능 최적화). 
   - 오직 비디오 생성 모델을 위한 최종 프롬프트 텍스트만 출력하세요.`;

  const parts = [
    { text: scenarioPrompt },
    ...files.map(f => ({
      inlineData: {
        data: f.data,
        mimeType: f.mimeType
      }
    }))
  ];

  const scenarioResponse = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: { parts },
  });

  const refinedPrompt = scenarioResponse.text || prompt;

  // Step 2: Generate Video using the refined scenario
  let operation = await ai.models.generateVideos({
    model: 'veo-3.1-fast-generate-preview',
    prompt: refinedPrompt,
    config: {
      numberOfVideos: 1,
      resolution: '720p',
      aspectRatio: aspectRatio
    }
  });

  // Poll for completion
  while (!operation.done) {
    await new Promise(resolve => setTimeout(resolve, 10000));
    operation = await ai.operations.getVideosOperation({ operation: operation });
  }

  const downloadLink = operation.response?.generatedVideos?.[0]?.video?.uri;
  if (!downloadLink) return null;

  const apiKey = process.env.API_KEY || process.env.GEMINI_API_KEY;
  const response = await fetch(downloadLink, {
    method: 'GET',
    headers: {
      'x-goog-api-key': apiKey || '',
    },
  });

  const blob = await response.blob();
  return {
    videoUrl: URL.createObjectURL(blob),
    scenario: refinedPrompt
  };
};
