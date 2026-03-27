import { NextRequest, NextResponse } from 'next/server';

const DEEPSEEK_API_KEY = process.env.DEEPSEEK_API_KEY;
const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

const SYSTEM_PROMPT = `You are a cryptocurrency security expert for BIP39.ai. Analyze the user's wallet setup and provide security advice.

Rules:
- NEVER ask users to share their mnemonic/private keys
- Analyze ONLY the metadata provided (word patterns, derivation paths, address formats)
- Provide actionable security recommendations
- Rate security level: Critical/Warning/Good/Excellent
- Keep responses concise (under 200 words)
- Respond in the same language as the user's input`;

interface AnalyzeRequest {
  type: 'mnemonic_check' | 'address_check' | 'setup_review';
  data: {
    wordCount?: number;
    hasPassphrase?: boolean;
    bipType?: string;
    coinType?: string;
    addressFormat?: string;
    entropySource?: string;
    // For mnemonic check - only patterns, never actual words
    hasRepeatedWords?: boolean;
    hasSequentialWords?: boolean;
    shannonScore?: number;
    pbkdf2Rounds?: number;
  };
  language: string;
}

async function callDeepSeek(messages: Array<{role: string; content: string}>) {
  const res = await fetch('https://api.deepseek.com/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${DEEPSEEK_API_KEY}`,
    },
    body: JSON.stringify({
      model: 'deepseek-chat',
      messages,
      max_tokens: 500,
      temperature: 0.3,
    }),
  });
  if (!res.ok) throw new Error(`DeepSeek error: ${res.status}`);
  const json = await res.json();
  return json.choices[0].message.content;
}

async function callOpenAI(messages: Array<{role: string; content: string}>) {
  const res = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${OPENAI_API_KEY}`,
    },
    body: JSON.stringify({
      model: 'gpt-4o-mini',
      messages,
      max_tokens: 500,
      temperature: 0.3,
    }),
  });
  if (!res.ok) throw new Error(`OpenAI error: ${res.status}`);
  const json = await res.json();
  return json.choices[0].message.content;
}

function buildPrompt(req: AnalyzeRequest): string {
  const d = req.data;
  const isZh = req.language === 'zh';

  switch (req.type) {
    case 'mnemonic_check':
      return isZh
        ? `分析这个助记词配置的安全性：
- 词数: ${d.wordCount}
- 有密码短语: ${d.hasPassphrase ? '是' : '否'}
- 有重复词: ${d.hasRepeatedWords ? '是' : '否'}
- 有连续词: ${d.hasSequentialWords ? '是' : '否'}
- Shannon 熵分数: ${d.shannonScore?.toFixed(3)}
- PBKDF2 轮数: ${d.pbkdf2Rounds}
- 熵来源: ${d.entropySource || '随机生成'}

请给出安全评级和改进建议。`
        : `Analyze this mnemonic configuration security:
- Word count: ${d.wordCount}
- Has passphrase: ${d.hasPassphrase ? 'Yes' : 'No'}
- Has repeated words: ${d.hasRepeatedWords ? 'Yes' : 'No'}
- Has sequential words: ${d.hasSequentialWords ? 'Yes' : 'No'}
- Shannon entropy score: ${d.shannonScore?.toFixed(3)}
- PBKDF2 rounds: ${d.pbkdf2Rounds}
- Entropy source: ${d.entropySource || 'Random generation'}

Provide a security rating and improvement suggestions.`;

    case 'setup_review':
      return isZh
        ? `审查这个钱包配置：
- BIP类型: ${d.bipType}
- 币种: ${d.coinType}
- 地址格式: ${d.addressFormat}
- 词数: ${d.wordCount}
- 有密码短语: ${d.hasPassphrase ? '是' : '否'}

评估配置是否最优并给出建议。`
        : `Review this wallet setup:
- BIP type: ${d.bipType}
- Coin: ${d.coinType}
- Address format: ${d.addressFormat}
- Word count: ${d.wordCount}
- Has passphrase: ${d.hasPassphrase ? 'Yes' : 'No'}

Evaluate if the configuration is optimal and provide suggestions.`;

    default:
      return 'Provide general BIP39 security advice.';
  }
}

export async function POST(request: NextRequest) {
  try {
    const body: AnalyzeRequest = await request.json();
    const userPrompt = buildPrompt(body);

    const messages = [
      { role: 'system', content: SYSTEM_PROMPT },
      { role: 'user', content: userPrompt },
    ];

    let result: string;
    try {
      // Try DeepSeek first (cheaper)
      result = await callDeepSeek(messages);
    } catch {
      // Fallback to OpenAI
      try {
        result = await callOpenAI(messages);
      } catch {
        return NextResponse.json(
          { error: 'AI service temporarily unavailable' },
          { status: 503 }
        );
      }
    }

    return NextResponse.json({ result });
  } catch {
    return NextResponse.json(
      { error: 'Invalid request' },
      { status: 400 }
    );
  }
}
