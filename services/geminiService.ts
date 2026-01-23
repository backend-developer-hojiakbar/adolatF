
import { GoogleGenAI, Type, Chat } from "@google/genai";
import type { DebateResult, ChatMessage, CaseFile, PreliminaryVerdict, SuggestedParticipant, CaseParticipant, CrossExaminationQuestion, Case, TimelineEvent, UsageInfo } from '../types';

if (!process.env.API_KEY) {
    throw new Error("API_KEY environment variable not set");
}

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

// Price per token: 30,000 UZS / 1,000,000 tokens = 0.03 UZS per token
const PRICE_PER_TOKEN = 0.03;

const calculateUsage = (totalTokens: number | undefined): UsageInfo => {
    const tokens = totalTokens || 0;
    return {
        totalTokens: tokens,
        cost: tokens * PRICE_PER_TOKEN
    };
};

const getSystemInstruction = (language: string, isInvestigation: boolean = false): string => {
    const base = `СЕН ЎЗБЕКИСТОН РЕСПУБЛИКАСИ ҚОНУНЧИЛИГИ БЎЙИЧА ЭНГ КУЧЛИ 5 ТА ЭКСПЕРТДАН ИБОРАТ "АДОЛАТ AI" АДВОКАТЛАР ЖАМОАСИСАН.
ҚАТЪИЙ ТАЛАБЛАР:
1. ЖАВОБЛАРНИ ФАҚАТ ЎЗБЕК ТИЛИДА ВА ФАҚАТ КИРИЛЛ АЛИФБОСИДА ЁЗ.
2. ҲАР БИР ҲУҚУҚИЙ ФИКРНИ ЎЗБЕКИСТОН РЕСПУБЛИКАСИ КОДЕКСЛАРИ ВА МОДДАЛАРИ БИЛАН АСОСЛА.
3. МАТНДАГИ ИСМЛАР ВА РОЛЛАРНИ (ДАЪВОГАР, ЖАВОБГАР) ҲЕЧ ҚАЧОН АДАШТИРМА.
4. ТАҲЛИЛ ЮЗАКИ БЎЛМАСИН, ИШНИНГ ЭНГ КИЧИК ДЕТАЛЛАРИГАЧА КИРИБ БОР.
5. ЖАВОБ ИЧИДА ЛОТИН АЛИФБОСИНИ ИШЛАТМА (ҲАВОЛАЛАРДАН ТАШҚАРИ).`;

    if (isInvestigation) {
        return `${base}\nСЕН ТЕРГОВ БОСҚИЧИДАГИ ИШЛАР БЎЙИЧА ЭКСПЕРТСАН. ЖАВОБГАРНИНГ ҲУҚУҚЛАРИ ВА ПРОЦЕССУАЛ ХАТОЛАРГА ДИҚҚАТ ҚИЛ.`;
    }
    return base;
};

const parseGeminiError = (error: any): Error => {
    console.error("ГЕМИНИ ХАТОЛИГИ:", error);
    const message = error?.message || 'Unknown error';
    if (message.includes("INVALID_ARGUMENT")) return new Error("Файл ҳажми жуда катта. Илтимос, файлларни кичироқ қилиб юборинг.");
    if (message.includes("[429]")) return new Error('error_api_rate_limit');
    return new Error('error_api_unknown');
};

const aggregateText = (caseDetails: string, files: CaseFile[] | undefined, limit: number = 60000): string => {
    let combined = `ИШ ТАФСИЛОТЛАРИ:\n${caseDetails}\n\n`;
    (files || []).forEach(f => {
        if (f.extractedText) {
            combined += `--- ҲУЖЖАТ МАЗМУНИ (${f.name}) ---
${f.extractedText}
--- ҲУЖЖАТ ТУГАДИ ---

`;
        }
    });
    return combined.length > limit ? combined.substring(0, limit) : combined;
};

const participantsSchema = {
    type: Type.OBJECT,
    properties: {
        participants: {
            type: Type.ARRAY,
            items: {
                type: Type.OBJECT,
                properties: {
                    name: { type: Type.STRING, description: "Шахснинг тўлиқ исми" },
                    suggestedRole: {
                        type: Type.STRING,
                        description: "Роли (Даъвогар, Жавобгар, Судланувчи, Жабрланувчи, Гувоҳ, Судья, Бошқа)"
                    }
                },
                required: ["name", "suggestedRole"]
            }
        }
    },
    required: ["participants"]
};

export const getCaseParticipants = async (caseDetails: string, files: CaseFile[], t: any, language: string): Promise<{ participants: SuggestedParticipant[], usage: UsageInfo }> => {
    try {
        const fullText = aggregateText(caseDetails, files, 40000);
        const fileParts = files
            .filter(f => f.content && (f.type === 'application/pdf' || f.type.startsWith('image/')))
            .slice(0, 3)
            .map(file => {
                const [, base64Data] = file.content!.split(',');
                return { inlineData: { mimeType: file.type, data: base64Data } };
            });

        const prompt = `Ушбу ҳужжат ва матнлардан иштирокчиларни ва уларнинг ролларини аниқла. МАТН: ${fullText}`;

        const response = await ai.models.generateContent({
            model: 'gemini-3-flash-preview',
            contents: { parts: [{ text: prompt }, ...fileParts] },
            config: {
                systemInstruction: getSystemInstruction(language),
                responseMimeType: "application/json",
                responseSchema: participantsSchema,
                temperature: 0.1
            },
        });

        const result = JSON.parse(response.text.trim());
        return {
            participants: result.participants || [],
            usage: calculateUsage(response.usageMetadata?.totalTokenCount)
        };
    } catch (error) {
        throw parseGeminiError(error);
    }
};

const legalStrategySchema = {
    type: Type.OBJECT,
    properties: {
        debate: {
            type: Type.ARRAY,
            items: {
                type: Type.OBJECT,
                properties: {
                    lawyerName: { type: Type.STRING },
                    analysis: { type: Type.STRING }
                },
                required: ["lawyerName", "analysis"]
            }
        },
        summary: { type: Type.STRING },
        winProbability: { type: Type.INTEGER },
        probabilityJustification: { type: Type.STRING },
        positiveFactors: { type: Type.ARRAY, items: { type: Type.STRING } },
        negativeFactors: { type: Type.ARRAY, items: { type: Type.STRING } },
        riskMatrix: {
            type: Type.ARRAY,
            items: {
                type: Type.OBJECT,
                properties: {
                    risk: { type: Type.STRING },
                    likelihood: { type: Type.STRING, enum: ['Паст', 'Ўрта', 'Юқори'] },
                    mitigation: { type: Type.STRING }
                },
                required: ["risk", "likelihood", "mitigation"]
            }
        },
        suggestedTasks: { type: Type.ARRAY, items: { type: Type.STRING } },
        knowledgeBase: {
            type: Type.OBJECT,
            properties: {
                keyFacts: { type: Type.ARRAY, items: { type: Type.OBJECT, properties: { fact: { type: Type.STRING }, relevance: { type: Type.STRING } }, required: ["fact", "relevance"] } },
                legalIssues: { type: Type.ARRAY, items: { type: Type.STRING } },
                applicableLaws: { type: Type.ARRAY, items: { type: Type.OBJECT, properties: { article: { type: Type.STRING }, summary: { type: Type.STRING }, url: { type: Type.STRING }, relevance: { type: Type.STRING } }, required: ["article", "summary"] } },
                strengths: { type: Type.ARRAY, items: { type: Type.STRING } },
                weaknesses: { type: Type.ARRAY, items: { type: Type.STRING } },
                statuteOfLimitations: { type: Type.OBJECT, properties: { status: { type: Type.STRING, enum: ['OK', 'Муддати ўтган', 'Хавф остида'] }, summary: { type: Type.STRING } }, required: ["status", "summary"] }
            },
            required: ["keyFacts", "legalIssues", "applicableLaws", "strengths", "weaknesses", "statuteOfLimitations"]
        }
    },
    required: ["debate", "summary", "winProbability", "probabilityJustification", "knowledgeBase", "riskMatrix", "suggestedTasks"]
};

export const getLegalStrategy = async (caseDetails: string, files: CaseFile[], courtType: string, courtStage: string, clientRole: string, clientName: string, participants: CaseParticipant[], t: any, language: string): Promise<DebateResult & { usage: UsageInfo }> => {
    try {
        const isInvestigation = courtStage === 'Tergov_raw';
        const fullText = aggregateText(caseDetails, files, 60000);
        const participantsList = participants.map(p => `- ${p.name}: ${p.role}${p.name === clientName ? ' (МЕНИНГ МИЖОЗИМ)' : ''}`).join('\n');

        const prompt = `СТРАТЕГИЯ ТУЗИНГ. МИЖОЗ: ${clientName}. МАТН: ${fullText}. ИШТИРОКЧИЛАР: ${participantsList}`;

        const response = await ai.models.generateContent({
            model: 'gemini-3-pro-preview',
            contents: { parts: [{ text: prompt }] },
            config: {
                systemInstruction: getSystemInstruction(language, isInvestigation),
                responseMimeType: "application/json",
                responseSchema: legalStrategySchema,
                temperature: 0.4,
                thinkingConfig: { thinkingBudget: 15000 }
            },
        });

        const parsed = JSON.parse(response.text.trim());
        const usage = calculateUsage(response.usageMetadata?.totalTokenCount);
        return { ...parsed, usage };
    } catch (error) { throw parseGeminiError(error); }
};

export const sendResearchMessage = async (message: string, t: any, language: string): Promise<ChatMessage> => {
    if (!researchChat) startResearchChat(t, language);
    const response = await researchChat!.sendMessage({ message });
    return {
        id: new Date().toISOString(),
        role: 'model',
        text: response.text,
        sources: response.candidates?.[0]?.groundingMetadata?.groundingChunks?.map(c => (c as any).web).filter(w => !!w?.uri) as any || [],
        usage: calculateUsage(response.usageMetadata?.totalTokenCount)
    };
};

let researchChat: Chat | null = null;
export const startResearchChat = (t: any, language: string) => {
    researchChat = ai.chats.create({
        model: 'gemini-3-flash-preview',
        config: {
            systemInstruction: `СЕН ЎЗБЕКИСТОН ҚОНУНЧИЛИГИ БЎЙИЧА ЭКСПЕРТ "ҚОНУН УСТУВОРИ"САН.`,
            tools: [{ googleSearch: {} }],
        },
    });
};

export const generateDocument = async (docType: string, caseData: Case, t: any, language: string): Promise<{ text: string, usage: UsageInfo }> => {
    try {
        const fullText = aggregateText(caseData.caseDetails, caseData.files, 50000);
        const prompt = `Ҳужжат ${docType} тайёрла. Иш: ${fullText}`;
        const response = await ai.models.generateContent({
            model: 'gemini-3-pro-preview',
            contents: { parts: [{ text: prompt }] },
            config: { systemInstruction: getSystemInstruction(language), temperature: 0.3 },
        });
        return {
            text: response.text,
            usage: calculateUsage(response.usageMetadata?.totalTokenCount)
        };
    } catch (error) { throw parseGeminiError(error); }
};

export const generateClientSummary = async (summary: string, t: any, language: string): Promise<{ text: string, usage: UsageInfo }> => {
    try {
        const response = await ai.models.generateContent({
            model: 'gemini-3-flash-preview',
            config: { systemInstruction: getSystemInstruction(language), temperature: 0.5 },
        });
        return {
            text: response.text || '',
            usage: calculateUsage(response.usageMetadata?.totalTokenCount)
        };
        return {
            text: response.text || '',
            usage: calculateUsage(response.usageMetadata?.totalTokenCount)
        };
    } catch (error) { throw parseGeminiError(error); }
};

export const getArticleSummary = async (code: string, t: any, language: string): Promise<{ text: string, usage: UsageInfo }> => {
    try {
        const response = await ai.models.generateContent({
            model: 'gemini-3-flash-preview',
            contents: { parts: [{ text: `${code} моддаси бўйича Ўзбекистон қонунчилиги асосида қисқа ва тушунарли шарҳ бер.` }] },
            config: { systemInstruction: getSystemInstruction(language), temperature: 0.1 },
        });
        return {
            text: response.text || '',
            usage: calculateUsage(response.usageMetadata?.totalTokenCount)
        };
    } catch (error) { throw parseGeminiError(error); }
};

export const getDocumentType = async (file: CaseFile, t: any, language: string): Promise<{ documentType: string, usage: UsageInfo }> => {
    try {
        const parts: any[] = [{ text: "Ҳужжат турини аниқла. Фақат JSON: {\"documentType\": \"...\"}" }];
        if (file.content && (file.type === 'application/pdf' || file.type.startsWith('image/'))) {
            const base64 = file.content.split(',')[1];
            parts.push({ inlineData: { mimeType: file.type, data: base64 } });
        } else if (file.extractedText) {
            parts[0].text += `\nМАТН: ${file.extractedText.substring(0, 3000)}`;
        }

        const response = await ai.models.generateContent({
            model: 'gemini-3-flash-preview',
            contents: { parts },
            config: { systemInstruction: getSystemInstruction(language), responseMimeType: "application/json" },
        });
        const result = JSON.parse(response.text.trim());
        return {
            documentType: result.documentType || "Бошқа",
            usage: calculateUsage(response.usageMetadata?.totalTokenCount)
        };
    } catch (error) { return { documentType: "Бошқа", usage: { totalTokens: 0, cost: 0 } }; }
};


// Use Django Backend for large files
export const analyzeLargeDocumentServer = async (file: File): Promise<string> => {
    const formData = new FormData();
    formData.append('file', file);

    try {
        // In production, use env variable VITE_API_URL
        const response = await fetch('https://advokatapi.aiproduct.uz/api/analyze-pdf/', {
            method: 'POST',
            body: formData,
        });

        if (!response.ok) {
            const errData = await response.json();
            throw new Error(errData.error || `Server error: ${response.statusText}`);
        }

        const data = await response.json();
        return data.analysis || "";
    } catch (error) {
        console.error("Backend analysis failed:", error);
        throw error;
    }
};

// Fix: Add prioritizeTasks function to handle task prioritization
export const prioritizeTasks = async (tasks: string[], t: any, language: string): Promise<string[]> => {
    try {
        const prompt = `Ушбу вазифаларни ҳуқуқий жиҳатдан муҳимлиги ва кечиктириб бўлмаслигига қараб тартибла. Фақат тартибланган вазифалар матнини JSON массив кўринишида қайтар. ВАЗИФАЛАР: ${JSON.stringify(tasks)}`;
        const response = await ai.models.generateContent({
            model: 'gemini-3-flash-preview',
            contents: { parts: [{ text: prompt }] },
            config: {
                systemInstruction: getSystemInstruction(language),
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.ARRAY,
                    items: { type: Type.STRING }
                }
            },
        });
        return JSON.parse(response.text.trim());
    } catch (error) { throw parseGeminiError(error); }
};

// Fix: Add generateTimeline function to extract timeline events from case materials
export const generateTimeline = async (caseDetails: string, files: CaseFile[], t: any, language: string): Promise<TimelineEvent[]> => {
    try {
        const fullText = aggregateText(caseDetails, files, 40000);
        const prompt = `Ушбу матн ва ҳужжатлардан муҳим воқеалар ва муддатларни (timeline) аниқла. Саналарни YYYY-MM-DD форматида қайтар. МАТН: ${fullText}`;
        const response = await ai.models.generateContent({
            model: 'gemini-3-flash-preview',
            contents: { parts: [{ text: prompt }] },
            config: {
                systemInstruction: getSystemInstruction(language),
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.ARRAY,
                    items: {
                        type: Type.OBJECT,
                        properties: {
                            date: { type: Type.STRING },
                            description: { type: Type.STRING }
                        },
                        required: ["date", "description"]
                    }
                }
            },
        });
        return JSON.parse(response.text.trim());
    } catch (error) { throw parseGeminiError(error); }
};

// Fix: Add transcribeAudioMemo function to record and transcribe audio using Gemini
export const transcribeAudioMemo = async (duration: number, t: any, language: string): Promise<string> => {
    return new Promise(async (resolve, reject) => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            const mediaRecorder = new MediaRecorder(stream);
            const chunks: Blob[] = [];

            mediaRecorder.ondataavailable = (e) => chunks.push(e.data);
            mediaRecorder.onstop = async () => {
                const blob = new Blob(chunks, { type: 'audio/webm' });
                const reader = new FileReader();
                reader.readAsDataURL(blob);
                reader.onloadend = async () => {
                    const base64Data = (reader.result as string).split(',')[1];
                    try {
                        const response = await ai.models.generateContent({
                            model: 'gemini-3-flash-preview',
                            contents: {
                                parts: [
                                    { inlineData: { mimeType: 'audio/webm', data: base64Data } },
                                    { text: "Ушбу аудио ёзувни матнга ўгир (транскрипция қил). Фақат матнни ўзини қайтар." }
                                ]
                            },
                            config: { systemInstruction: getSystemInstruction(language) }
                        });
                        resolve(response.text.trim());
                    } catch (err) {
                        reject(parseGeminiError(err));
                    }
                };
            };

            mediaRecorder.start();
            setTimeout(() => mediaRecorder.stop(), duration * 1000);
        } catch (err) {
            reject(new Error('error_microphone_access'));
        }
    });
};

// Fix: Add getDeepDiveAnalysis function to perform detailed case analysis
export const getDeepDiveAnalysis = async (caseDetails: string, files: CaseFile[], courtType: string, courtStage: string, participants: CaseParticipant[], t: any, language: string): Promise<{ analysis: string, usage: UsageInfo }> => {
    try {
        const fullText = aggregateText(caseDetails, files, 60000);
        const participantsList = participants.map(p => `- ${p.name}: ${p.role}`).join('\n');

        const isInvestigation = courtStage === 'Tergov_raw';
        const prompt = `СЕН - ОЛИЙ СУД СУДЬЯСИСАН. Ишни ҳар томонлама, холисона ва ўта чуқур таҳлил қил.
        
        ТАЛАБЛАР:
        1. "ПРОКУРОР НИГОҲИ": Айблов/Даъво тарафининг энг кучли аргументларини келтир.
        2. "АДВОКАТ ҲИМОЯСИ": Ҳимоя тарафининг энг кучли қарши далилларини келтир.
        3. "ҚОНУН ТАРОЗИСИ": Ўзбекистон қонунчилиги, Кодекслар ва Олий Суд Пленуми қарорларига аниқ ҳаволалар (модда рақамлари билан) келтир.
        4. "ФАКТЛАР ТЎҚНАШУВИ": Ишдаги далиллар ўртасидаги зиддиятларни топиб, уларни "QIZIL BAYROQ" 🚩 деб белгила.
        5. "СТРАТЕГИК ЙЎЛ ХАРИТАСИ": Ютиш учун қадам-бақадам, аниқ ва лўнда ҳаракатлар режасини туз.

        МАТН: ${fullText}
        ИШТИРОКЧИЛАР: ${participantsList}
        СУД ТУРИ: ${courtType}
        БОСҚИЧ: ${courtStage === 'Tergov_raw' ? 'Тергов' : 'Суд'}`;

        const response = await ai.models.generateContent({
            model: 'gemini-3-pro-preview',
            contents: { parts: [{ text: prompt }] },
            config: {
                systemInstruction: getSystemInstruction(language, isInvestigation),
                temperature: 0.6,
                thinkingConfig: { thinkingBudget: 20000 }
            },
        });

        return {
            analysis: response.text,
            usage: calculateUsage(response.usageMetadata?.totalTokenCount)
        };
    } catch (error) { throw parseGeminiError(error); }
};

export const generateSimulationData = async (caseDetails: string, files: CaseFile[], courtType: string, courtStage: string, participants: CaseParticipant[], t: any, language: string): Promise<{ courtroomScenario: string, crossExaminationQuestions: CrossExaminationQuestion[], closingArgumentLead: string, closingArgumentDefender: string, usage: UsageInfo }> => {
    try {
        const fullText = aggregateText(caseDetails, files, 50000);
        const participantsList = participants.map(p => `- ${p.name}: ${p.role}`).join('\n');

        const prompt = `Суд зали симуляцияси яратинг. Иш тури: ${courtType}. Иш босқичи: ${courtStage}. Маҳкема матни: ${fullText}. Иштирокчилар: ${participantsList}`;

        const simulationSchema = {
            type: Type.OBJECT,
            properties: {
                courtroomScenario: { type: Type.STRING },
                crossExaminationQuestions: {
                    type: Type.ARRAY,
                    items: {
                        type: Type.OBJECT,
                        properties: {
                            question: { type: Type.STRING },
                            suggestedAnswer: { type: Type.STRING }
                        },
                        required: ["question", "suggestedAnswer"]
                    }
                },
                closingArgumentLead: { type: Type.STRING },
                closingArgumentDefender: { type: Type.STRING }
            },
            required: ["courtroomScenario", "crossExaminationQuestions", "closingArgumentLead", "closingArgumentDefender"]
        };

        const response = await ai.models.generateContent({
            model: 'gemini-3-pro-preview',
            contents: { parts: [{ text: prompt }] },
            config: {
                systemInstruction: `СЕН ЎЗБЕКИСТОН ҚОНУНЧИЛИГИ БЎЙИЧА ЭКСПЕРТ "ҚОНУН УСТУВОРИ"САН. Суд зали симуляцияси яратинг. Жавобингизни фақат ўзбек тилида ёзинг.`,
                responseMimeType: "application/json",
                responseSchema: simulationSchema,
                temperature: 0.4,
                thinkingConfig: { thinkingBudget: 15000 }
            },
        });

        const parsed = JSON.parse(response.text.trim());
        const usage = calculateUsage(response.usageMetadata?.totalTokenCount);
        return { ...parsed, usage };
    } catch (error) { throw parseGeminiError(error); }
};

export const recognizeTextFromImage = async (base64Data: string, t: any): Promise<{ text: string, usage: UsageInfo }> => {
    try {
        const response = await ai.models.generateContent({
            model: 'gemini-3-flash-preview',
            contents: {
                parts: [
                    { inlineData: { mimeType: 'image/jpeg', data: base64Data } },
                    { text: "Extract all text from this image directly. Return only the text content." }
                ]
            },
            config: {
                systemInstruction: "You are an advanced OCR engine. Extract text exactly as it appears. If there is no text, say 'No text found'.",
                temperature: 0.1
            }
        });
        return {
            text: response.text || '',
            usage: calculateUsage(response.usageMetadata?.totalTokenCount)
        };
    } catch (error) { throw parseGeminiError(error); }
};
