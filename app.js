const app = {
  started: false,
  currentIndex: 0,
  answers: {},
  lastResultText: "",
  isAdvancing: false,
};

const screens = {
  intro: document.getElementById("screen-intro"),
  test: document.getElementById("screen-test"),
  result: document.getElementById("screen-result"),
};

const questionTitle = document.getElementById("questionTitle");
const optionsEl = document.getElementById("options");
const counterEl = document.getElementById("counter");
const progressBar = document.getElementById("progressBar");
const prevBtn = document.getElementById("prevBtn");
const copyBtn = document.getElementById("copyBtn");
const answerModeSwitch = document.getElementById("answerModeSwitch");
const answerModeButtons = answerModeSwitch.querySelectorAll("[data-answer-mode]");

const optionCodes = ["A", "B", "C", "D", "E"];
const baseScores = { A: -100, B: -50, C: 0, D: 50, E: 100 };
const dimensionTieBreakOrder = ["C", "T", "R", "E"];
const RESULT_IMAGE_ALIASES = {
  隐身梅: "隐身者",
  跳水罗: "跳水者",
};
const PLAYER_PRESENTATION = {
  梅西: { code: "LM10", color: "#5b9fc9" },
  莫德里奇: { code: "LM10", color: "#c71f2d" },
  巴尔韦德: { code: "FV15", color: "#55aee6" },
  姆巴佩: { code: "KM10", color: "#213a70" },
  c罗: { code: "CR7", color: "#b51f35" },
  C罗: { code: "CR7", color: "#b51f35" },
  坎特: { code: "NG13", color: "#213a70" },
  贝林厄姆: { code: "JB10", color: "#22385e" },
  大马丁: { code: "EM23", color: "#5b9fc9" },
  穆西亚拉: { code: "JM10", color: "#1c1c1c" },
  哈兰德: { code: "EH9", color: "#ba1b2d" },
  卡塞米罗: { code: "CS5", color: "#178b43" },
  维尼修斯: { code: "VJ7", color: "#178b43" },
  赖斯: { code: "DR4", color: "#22385e" },
  维尔茨: { code: "FW17", color: "#1c1c1c" },
  内马尔: { code: "NJ10", color: "#178b43" },
  哈利凯恩: { code: "HK9", color: "#22385e" },
  德保罗: { code: "RP7", color: "#5b9fc9" },
  孙兴慜: { code: "HM7", color: "#c91c30" },
  亚马尔: { code: "LY19", color: "#aa151b" },
  罗德里: { code: "RH16", color: "#aa151b" },
  基米希: { code: "JK6", color: "#1c1c1c" },
  奥利赛: { code: "MO11", color: "#213a70" },
  B费: { code: "BF8", color: "#b51f35" },
  登贝莱: { code: "OD7", color: "#213a70" },
  阿什拉夫: { code: "AH2", color: "#b7192f" },
  莱奥: { code: "RL10", color: "#b51f35" },
};
const RESULT_PRESENTATION = {
  隐身者: {
    slogan: "寻梅启事。",
    description: "你习惯把自己藏进整体运转里，不抢戏，也不急着证明什么。场面越混乱，你越愿意用安静的方式寻找决定性一脚。",
  },
  绅士: {
    slogan: "把比赛踢赢，也把体面留在场上。",
    description: "你重视规则、分寸和优雅的处理方式。即使竞争激烈，你也更愿意凭判断与技术解决问题，而不是让情绪接管比赛。",
  },
  红牌英雄: {
    slogan: "个人可以下场，奖杯必须留下。",
    description: "你把团队目标放在自己之前。关键时刻敢于承担代价，也愿意做那个不一定光鲜、却真正改变结果的人。",
  },
  独裁者: {
    slogan: "把球传给法兰西之剑。",
    description: "你相信顶级比赛需要明确的核心和强势的决定。你习惯掌控节奏，也希望最重要的选择最终由最有能力的人完成。",
  },
  老实人: {
    slogan: "献出袖标。",
    description: "你可靠、谦逊，并且天然愿意为身边的人补位。你不执着于成为主角，但常常是团队最离不开的那个人。",
  },
  骑士: {
    slogan: "骑士，向前。",
    description: "你既有向前的勇气，也保留清晰的原则感。面对压力时，你更愿意正面解决问题，用行动赢得尊重。",
  },
  卧草者: {
    slogan: "时间也是战术，领先就是艺术。",
    description: "你擅长判断局势，并且知道什么时候应该降低风险。对你来说，控制时间与空间和创造机会同样重要。",
  },
  跳水者: {
    slogan: "在禁区中上演水花消失术。",
    description: "你对胜负极其敏感，也很懂得利用规则和场面。只要能创造优势，你不介意把每个细节都变成比赛的一部分。",
  },
  小鹿斑比: {
    slogan: "脚步轻得像小鹿，防线却追不上你。",
    description: "你安静、灵巧，习惯用细腻触球和突然变向解决问题。外表温和不代表缺少锋芒，你更愿意让行动代替声量。",
  },
  魔人布欧: {
    slogan: "不吃小孩的魔人布欧。",
    description: "你给人的第一印象可能强势甚至有压迫感，实际却友善、直接而讲道理。反差感是你最鲜明的个人魅力。",
  },
  黄牌大师: {
    slogan: "把黄牌花在刀刃上。",
    description: "你冷静、务实，懂得用最小代价阻止最坏结果。你并不迷恋冒险，但关键时刻从不回避必要的决定。",
  },
  挑衅者: {
    slogan: "Stop Crying Your Heart Out",
    description: "你享受对抗、气氛和情绪拉扯。越是被质疑，你越容易被激活，并用更张扬的方式回应整个赛场。",
  },
  回传者: {
    slogan: "过不去先回。",
    description: "你把稳定和控球权看得很重。与其冒险送出一次漂亮传球，你更愿意让团队重新组织，把失误概率降到最低。",
  },
  抽奖者: {
    slogan: "传球像开盲盒，大奖只需要一次。",
    description: "你愿意不断尝试高难度选择。失败不会让你停止创造，因为你知道一次成功就可能直接改变比赛。",
  },
  吃饼者: {
    slogan: "吃饼不忘做饼人。",
    description: "你对机会有敏锐嗅觉，行动直接而高效。复杂过程不是你的重点，把优势转化为结果才是你的价值。",
  },
  舞者: {
    slogan: "过人不是路线，是舞步。",
    description: "你追求自由、灵感和表达感。对你来说，完成任务固然重要，但用漂亮且独特的方式完成更让人着迷。",
  },
  "“我的”人": {
    slogan: "我的，兄弟，这球我的。",
    description: "你有很强的责任感，不习惯把问题推给别人。即使犯错，你也会迅速承认并重新投入下一次行动。",
  },
  保镖: {
    slogan: "保护我方输出。",
    description: "你忠诚、强硬，也很清楚自己要保护什么。你愿意站在聚光灯之外，为重要的人和团队守住边界。",
  },
  亚洲式球王: {
    slogan: "高光可以很大，庆祝不必太响。",
    description: "你能力出众，却不喜欢过度张扬。比起制造声势，你更相信持续表现与克制的自信。",
  },
  皇毛: {
    slogan: "头上戴的是皇冠，还是黄毛？",
    description: "你年轻、自信，也乐于把争议变成舞台。外界越想定义你，你越希望用自己的方式完成加冕。",
  },
  苟分者: {
    slogan: "不冒险，也能把胜利攥到终场。",
    description: "你擅长控制节奏、减少变量，并把优势稳稳保存下来。看似保守的选择背后，是对局势精准的计算。",
  },
  场上教练: {
    slogan: "你不仅在踢球，也在替所有人排兵布阵。",
    description: "你习惯观察全局、提醒站位并指挥下一步行动。比起等待场边给出答案，你更愿意在比赛运行中直接整理秩序。",
  },
  带派者: {
    slogan: "长相东北雨，过人不讲理。",
    description: "你冷静、有风格，不需要太多动作就能形成存在感。越是关键的场面，你越愿意用从容回应压力。",
  },
  摊手者: {
    slogan: "没别的意思，单纯爱摊手。",
    description: "你对比赛有高要求，也很容易看见系统中的问题。表达不满是你的本能，但真正驱动你的仍是强烈的求胜欲。",
  },
  游戏王: {
    slogan: "梅罗时代游戏王。",
    description: "你的竞技欲并不局限于草坪。只要有操作、博弈和胜负，你总能迅速进入自己的主场。",
  },
  哈基米: {
    slogan: "哈基米南北绿豆。",
    description: "送你一只哈基米，摩洛哥后卫阿什拉夫·哈基米。",
  },
  串子: {
    slogan: "里奥·C·罗。",
    description: "你擅长观察情绪、制造反应，并从混乱中获得乐趣。别人忙着站队时，你已经开始导演下一回合。",
  },
  乐子人: {
    slogan: "轻松绷住。",
    description: "你对足球的兴趣首先来自故事、争论和意外。比赛只是舞台，真正吸引你的是源源不断的戏剧性。",
  },
  隐身梅: {
    slogan: "寻梅启事。",
    description: "你擅长在安静与决定性之间切换。存在感未必持续在线，但每一次出现都足以引发新的争论。",
  },
  数据罗: {
    slogan: "数字不会沉默，纪录就是扩音器。",
    description: "你相信持续输出能回答绝大多数质疑。目标清晰、行动直接，结果就是你最有力的表达。",
  },
  跳水罗: {
    slogan: "在禁区中上演水花消失术。",
    description: "你对机会极度敏锐，也从不浪费规则给予的空间。争议无法阻止你继续追求结果。",
  },
  受气梅: {
    slogan: "给你俩窝窝。",
    description: "你习惯用表现而不是争辩回应外界。克制让你偶尔显得沉默，却也让你的行动更有分量。",
  },
  詹姆斯: {
    slogan: "每一次选择，都要成为新的素材。",
    description: "你兼具团队意识与强烈的话题感。无论场上场下，你总能让普通瞬间获得额外关注。",
  },
  浪射罗: {
    slogan: "不试一脚，怎么知道会不会进。",
    description: "你相信机会来自持续尝试。即使成功率并不完美，你也不会放弃下一次直接改变比分的可能。",
  },
  散步梅: {
    slogan: "溜达溜达就下班了。",
    description: "你不愿把能量浪费在无效动作上。安静观察、精准判断，然后在真正重要的时刻参与比赛。",
  },
  摊手罗: {
    slogan: "标准很高，所以不满总是写在脸上。",
    description: "你对自己和队友都有强烈期待。情绪表达直接，但背后仍是对胜利近乎固执的渴望。",
  },
  越位罗: {
    slogan: "裁判哨响，C罗抢跑。",
    description: "你总在寻找防线身后的空间。冒险会带来越位，也会带来最直接、最致命的机会。",
  },
  勤笑公: {
    slogan: "笑一个吧，这里测不出你的人格。",
    description: "你的四个维度保持着罕见的均衡。你不会被单一倾向彻底定义，面对不同比赛和人群时，总能自然切换自己的处理方式。",
  },
};

function showScreen(name) {
  Object.entries(screens).forEach(([key, screen]) => {
    screen.classList.toggle("is-active", key === name);
  });
  window.scrollTo({ top: 0, behavior: "smooth" });
}

function getDimension(key) {
  return FBTI_DATA.dimensions.find((dimension) => dimension.key === key);
}

function getIntroQuestions() {
  const { introQuestions } = FBTI_DATA;
  const questions = [introQuestions.gate];
  const gate = app.answers.gate;

  if (gate === "messi") {
    questions.push(introQuestions.messiDepth);
  }

  if (gate === "ronaldo") {
    questions.push(introQuestions.ronaldoDepth);
  }

  if (gate === "meme") {
    questions.push(introQuestions.memeDepth);
    if (app.answers.memeDepth === "troll") {
      questions.push(introQuestions.trollSide);
    }
  }

  return questions;
}

function getIntroState() {
  const gate = app.answers.gate;
  const state = {
    complete: false,
    segment: "fan",
    segmentLabel: "懂球组",
    extreme: false,
    bias: null,
    hidden: null,
  };

  if (!gate) return state;

  if (gate === "both") {
    state.complete = true;
    return state;
  }

  if (gate === "unknown") {
    state.complete = true;
    state.segment = "novice";
    state.segmentLabel = "萌新组";
    return state;
  }

  if (gate === "messi" || gate === "ronaldo") {
    const answerId = gate === "messi" ? "messiDepth" : "ronaldoDepth";
    const depth = app.answers[answerId];
    if (!depth) return state;

    state.complete = true;
    state.bias = gate;
    if (depth === "light") {
      state.segment = "novice";
      state.segmentLabel = "萌新组";
    }
    if (depth === "goat" || depth === "extreme") {
      state.extreme = true;
      state.segmentLabel = gate === "messi" ? "梅西极端球迷组" : "C罗极端球迷组";
    }
    return state;
  }

  if (gate === "meme") {
    const memeDepth = app.answers.memeDepth;
    if (!memeDepth) return state;

    state.segment = "fan";
    state.segmentLabel = "懂球组";

    if (memeDepth === "debateOnly") {
      state.segment = "novice";
      state.segmentLabel = "萌新组";
      state.hidden = "fun";
    }

    if (memeDepth === "troll") {
      const trollSide = app.answers.trollSide;
      if (!trollSide) return state;
      if (["fakeMessi", "fakeRonaldo", "both"].includes(trollSide)) {
        state.segment = "novice";
        state.segmentLabel = "萌新组";
        state.hidden = "troll";
      }
    }

    state.complete = true;
    return state;
  }

  return state;
}

function getStandardQuestions() {
  const introState = getIntroState();
  const segment = getTestingSegment(introState);
  return FBTI_DATA.questionBanks[segment] || FBTI_DATA.questionBanks.fan;
}

function shouldSkipOffPitchQuestions(introState) {
  return ["fun", "troll"].includes(introState.hidden);
}

function getOffPitchConfirmationQuestion() {
  const offPitch = app.answers.offPitchLife;
  return FBTI_DATA.hiddenConfirmationQuestions[offPitch] || null;
}

function getTestingSegment(introState = getIntroState()) {
  if (shouldSkipOffPitchQuestions(introState)) return "novice";

  const offPitch = app.answers.offPitchLife;
  if (offPitch === "play" || offPitch === "watch") return "fan";
  if (["neither", "game", "cat"].includes(offPitch)) return "novice";
  return introState.segment;
}

function getFlow() {
  const intro = getIntroQuestions();
  const introState = getIntroState();
  if (!introState.complete) return intro;

  const pretestQuestions = [];
  if (!shouldSkipOffPitchQuestions(introState)) {
    pretestQuestions.push(FBTI_DATA.hiddenQuestion);
    const confirmationQuestion = getOffPitchConfirmationQuestion();
    if (confirmationQuestion) pretestQuestions.push(confirmationQuestion);
  }

  return [
    ...intro,
    ...pretestQuestions,
    FBTI_DATA.answerModeQuestion,
    ...getStandardQuestions(),
  ];
}

function getDisplayTotal() {
  const introState = getIntroState();
  const hiddenQuestionCount = shouldSkipOffPitchQuestions(introState) ? 0 : 1;
  const confirmationQuestionCount = getOffPitchConfirmationQuestion() ? 1 : 0;
  return (
    getIntroQuestions().length +
    1 +
    FBTI_DATA.questionBanks.fan.length +
    hiddenQuestionCount +
    confirmationQuestionCount
  );
}

function pruneAnswers(flow) {
  const validIds = new Set(flow.map((question) => question.id));
  Object.keys(app.answers).forEach((answerId) => {
    if (!validIds.has(answerId)) {
      delete app.answers[answerId];
    }
  });
}

function normalizeOptions(question) {
  let options;
  if (typeof question.options[0] === "string") {
    options = question.options.map((label, index) => ({
      code: optionCodes[index],
      value: optionCodes[index],
      label,
    }));
  } else {
    options = question.options;
  }

  if (question.dim && app.answers.answerMode === "quick") {
    return options.filter((option) => ["A", "C", "E"].includes(option.code));
  }

  return options;
}

function renderAnswerModeSwitch(question) {
  const isFormalQuestion = Boolean(app.answers.answerMode && question.dim);
  answerModeSwitch.hidden = !isFormalQuestion;

  answerModeButtons.forEach((button) => {
    const isActive = button.dataset.answerMode === app.answers.answerMode;
    button.classList.toggle("is-active", isActive);
    button.ariaPressed = String(isActive);
  });
}

function renderQuestion() {
  app.isAdvancing = false;
  const flow = getFlow();
  pruneAnswers(flow);

  if (app.currentIndex >= flow.length) {
    app.currentIndex = flow.length - 1;
  }

  const question = flow[app.currentIndex];
  const options = normalizeOptions(question);
  const selectedValue = app.answers[question.id];
  const displayTotal = getDisplayTotal();
  const displayIndex = app.currentIndex + 1;

  renderAnswerModeSwitch(question);
  questionTitle.textContent = question.text;
  counterEl.textContent = `${displayIndex} / ${displayTotal}`;
  progressBar.style.width = `${Math.round((displayIndex / displayTotal) * 100)}%`;

  optionsEl.innerHTML = options
    .map((option) => {
      const isSelected = option.value === selectedValue;
      return `
        <button class="option-btn${isSelected ? " is-selected" : ""}" data-value="${option.value}">
          <span>${option.code}</span>
          <strong>${option.label}</strong>
        </button>
      `;
    })
    .join("");

  optionsEl.querySelectorAll(".option-btn").forEach((button) => {
    button.addEventListener("click", () => {
      if (app.isAdvancing) return;
      app.isAdvancing = true;
      app.answers[question.id] = button.dataset.value;
      optionsEl.querySelectorAll(".option-btn").forEach((optionButton) => {
        optionButton.disabled = true;
        optionButton.classList.toggle("is-selected", optionButton === button);
      });
      window.setTimeout(goNext, 180);
    });
  });

  prevBtn.disabled = app.currentIndex === 0;
}

function goNext() {
  const flow = getFlow();
  const question = flow[app.currentIndex];
  if (app.answers[question.id] === undefined) return;

  if (app.currentIndex === flow.length - 1) {
    renderResult();
    return;
  }

  app.currentIndex += 1;
  renderQuestion();
}

function goPrev() {
  if (app.currentIndex === 0) return;
  app.currentIndex -= 1;
  renderQuestion();
}

function startTest() {
  app.started = true;
  app.currentIndex = 0;
  app.answers = {};
  app.lastResultText = "";
  app.isAdvancing = false;
  showScreen("test");
  renderQuestion();
}

function getQuestionScore(question, answerCode) {
  const raw = baseScores[answerCode] || 0;
  return question.leftFirst ? raw : -raw;
}

function computeScores() {
  const introState = getIntroState();
  const segment = getTestingSegment(introState);
  const bank = FBTI_DATA.questionBanks[segment] || FBTI_DATA.questionBanks.fan;
  const scores = {};
  const counts = {};

  FBTI_DATA.dimensions.forEach((dimension) => {
    scores[dimension.key] = 0;
    counts[dimension.key] = 0;
  });

  bank.forEach((question) => {
    const answer = app.answers[question.id];
    if (!answer) return;
    scores[question.dim] += getQuestionScore(question, answer);
    counts[question.dim] += 1;
  });

  return FBTI_DATA.dimensions.map((dimension) => {
    const count = counts[dimension.key] || 1;
    const total = scores[dimension.key] || 0;
    const average = total / count;
    const resultSide = average >= 0 ? dimension.right : dimension.left;
    const resultSideShort = average >= 0 ? dimension.rightShort : dimension.leftShort;
    const side =
      average > 0 ? dimension.right : average < 0 ? dimension.left : "中立";
    const sideShort =
      average > 0 ? dimension.rightShort : average < 0 ? dimension.leftShort : "中立";
    return {
      ...dimension,
      total,
      count,
      average,
      side,
      sideShort,
      resultSide,
      resultSideShort,
      strength: Math.min(1, Math.abs(average) / 100),
    };
  });
}

function getDominantAxes(scoreRows) {
  return [...scoreRows].sort(compareDimensionStrength).slice(0, 2);
}

function compareDimensionStrength(a, b) {
  if (b.strength !== a.strength) return b.strength - a.strength;
  return dimensionTieBreakOrder.indexOf(a.key) - dimensionTieBreakOrder.indexOf(b.key);
}

function getResultKey(axes) {
  return [...axes]
    .sort((a, b) => FBTI_DATA.dimensionOrder.indexOf(a.key) - FBTI_DATA.dimensionOrder.indexOf(b.key))
    .map((axis) => axis.resultSide)
    .join("×");
}

function parseExtremeResult(text) {
  if (!text) return null;
  const parts = text.trim().split(/\s+/);
  if (parts.length === 1) {
    return { label: parts[0], player: "待补球员" };
  }
  const player = parts[0];
  const label = parts.slice(1).join(" ");
  return {
    player,
    label,
    imageKey:
      label === "詹姆斯"
        ? player === "梅西"
          ? "詹姆斯梅"
          : "詹姆斯罗"
        : RESULT_IMAGE_ALIASES[label] || label,
  };
}

function getHiddenOverride(introState) {
  const offPitch = app.answers.offPitchLife;
  if (introState.hidden) return FBTI_DATA.hiddenResults[introState.hidden];
  if (
    offPitch === "game" &&
    ["D", "E"].includes(app.answers[FBTI_DATA.hiddenConfirmationQuestions.game.id])
  ) {
    return FBTI_DATA.hiddenResults.game;
  }
  if (
    offPitch === "cat" &&
    ["D", "E"].includes(app.answers[FBTI_DATA.hiddenConfirmationQuestions.cat.id])
  ) {
    return FBTI_DATA.hiddenResults.cat;
  }
  return null;
}

function getFinalResult() {
  const introState = getIntroState();
  const scoreRows = computeScores();
  const axes = getDominantAxes(scoreRows);
  const resultKey = getResultKey(axes);
  const normalResult =
    FBTI_DATA.results.find((result) => result.key === resultKey) || FBTI_DATA.results[0];

  const directHidden = getHiddenOverride(introState);
  if (directHidden) {
    return {
      type: "hidden",
      introState,
      scoreRows,
      axes,
      resultKey,
      normalResult,
      final: directHidden,
      reason: directHidden.reason,
    };
  }

  const hasEqualStrengths = scoreRows.every(
    (row) => row.strength === scoreRows[0].strength,
  );
  if (hasEqualStrengths) {
    const balanced = FBTI_DATA.hiddenResults.balanced;
    return {
      type: "hidden",
      introState,
      scoreRows,
      axes,
      resultKey,
      normalResult,
      final: balanced,
      reason: balanced.reason,
    };
  }

  if (introState.extreme && normalResult.extreme) {
    const extreme = parseExtremeResult(normalResult.extreme);
    return {
      type: "extreme",
      introState,
      scoreRows,
      axes,
      resultKey,
      normalResult,
      final: {
        ...extreme,
        kind: "梅罗极端隐藏款",
      },
      reason: "你在开场题进入梅罗极端球迷分支，并且最终组合命中了表格里的隐藏款。",
    };
  }

  return {
    type: "normal",
    introState,
    scoreRows,
    axes,
    resultKey,
    normalResult,
    final: {
      label: normalResult.label,
      player: normalResult.player,
      kind: "标准人格",
    },
    reason: "",
  };
}

function resultImageBasePath(result) {
  const imageName = result.imageKey || result.label;
  const cleanName = imageName.replace(/[“”"']/g, "").replace(/[\\/:*?<>|]/g, "");
  return `./assets/personality-images/${cleanName}`;
}

function loadResultImage(final, imagePlaceholder, resultImage) {
  const basePath = resultImageBasePath(final);
  const extensions = ["png", "jpg", "jpeg"];
  let extensionIndex = 0;

  imagePlaceholder.classList.remove("has-image");
  resultImage.removeAttribute("src");
  resultImage.alt = `${final.label}人格图`;

  const tryNextExtension = () => {
    if (extensionIndex >= extensions.length) {
      resultImage.onerror = null;
      return;
    }
    resultImage.src = `${basePath}.${extensions[extensionIndex]}`;
    extensionIndex += 1;
  };

  resultImage.onload = () => {
    imagePlaceholder.classList.add("has-image");
  };
  resultImage.onerror = tryNextExtension;
  tryNextExtension();
}

function renderDimensionBars(scoreRows) {
  const bars = document.getElementById("dimensionBars");
  const rankedRows = [...scoreRows].sort(compareDimensionStrength);

  bars.innerHTML = rankedRows
    .map((row, index) => {
      const percent = Math.round(row.strength * 100);
      const dominantClass = index < 2 ? " is-dominant" : "";
      return `
        <div class="dimension-row${dominantClass}">
          <div class="dimension-rank">${String(index + 1).padStart(2, "0")}</div>
          <div class="dimension-main">
            <div class="dimension-heading">
              <span>${row.name}</span>
              <strong>${row.side}</strong>
            </div>
            <div class="dimension-track">
              <span style="width:${percent}%"></span>
            </div>
          </div>
          <div class="dimension-value">
            <strong>${percent}</strong><span>%</span>
          </div>
        </div>
      `;
    })
    .join("");
}

function getResultPresentation(result) {
  const presentation = RESULT_PRESENTATION[result.final.label];
  if (presentation) return presentation;

  const axisText = result.axes.map((axis) => axis.side).join("与");
  return {
    slogan: "你的踢法，就是你看待比赛的方式。",
    description: `你最鲜明的倾向是${axisText}。这两种特质共同决定了你在场上的选择、节奏和表达方式。`,
  };
}

function renderResult() {
  const result = getFinalResult();
  const final = result.final;
  const imagePlaceholder = document.getElementById("imagePlaceholder");
  const resultImage = document.getElementById("resultImage");
  const presentation = getResultPresentation(result);
  const playerPresentation = PLAYER_PRESENTATION[final.player];
  const resultPlayerCode = document.getElementById("resultPlayerCode");
  const resultPlayerRow = document.getElementById("resultPlayerRow");
  const hasPlayer = Boolean(final.player && final.player !== "待补球员");

  document.getElementById("resultName").textContent = final.label;
  document.getElementById("resultDetailName").textContent = final.label;
  document.getElementById("resultPlayerChinese").textContent = hasPlayer ? final.player : "";
  resultPlayerCode.textContent = hasPlayer ? playerPresentation?.code || final.player : "";
  resultPlayerCode.hidden = !hasPlayer;
  resultPlayerRow.hidden = !hasPlayer;
  document
    .getElementById("resultCard")
    .style.setProperty("--player-color", playerPresentation?.color || "var(--green)");
  document.getElementById("resultSlogan").textContent = presentation.slogan;
  document.getElementById("resultDescription").textContent = presentation.description;

  loadResultImage(final, imagePlaceholder, resultImage);
  renderDimensionBars(result.scoreRows);

  const playerText = hasPlayer ? ` / ${final.player}` : "";
  app.lastResultText = `我的 FBTI 足球人格：${final.label}${playerText}。${presentation.slogan} ${presentation.description}`;
  copyBtn.textContent = "复制结果";
  showScreen("result");
}

async function copyResult() {
  try {
    await navigator.clipboard.writeText(app.lastResultText);
    copyBtn.textContent = "已复制";
  } catch (error) {
    copyBtn.textContent = "复制失败";
  }
}

document.getElementById("startBtn").addEventListener("click", startTest);
document.getElementById("restartBtn").addEventListener("click", startTest);
document.getElementById("restartMiniBtn").addEventListener("click", startTest);
document.getElementById("prevBtn").addEventListener("click", goPrev);
document.getElementById("copyBtn").addEventListener("click", copyResult);
answerModeButtons.forEach((button) => {
  button.addEventListener("click", () => {
    app.answers.answerMode = button.dataset.answerMode;
    renderQuestion();
  });
});
