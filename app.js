const app = {
  started: false,
  currentIndex: 0,
  answers: {},
  lastResultText: "",
  isAdvancing: false,
  randomResultIndex: null,
  currentResult: null,
  descriptionFeedbackChoice: null,
  descriptionChangeTimer: null,
  descriptionFeedbackLocked: false,
  descriptionFeedbackTimer: null,
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
const shareBtn = document.getElementById("shareBtn");
const saveBtn = document.getElementById("saveBtn");
const resultDescriptionEl = document.getElementById("resultDescription");
const descriptionFeedback = document.getElementById("descriptionFeedback");
const feedbackLikeBtn = document.getElementById("feedbackLikeBtn");
const feedbackDislikeBtn = document.getElementById("feedbackDislikeBtn");
const answerModeSwitch = document.getElementById("answerModeSwitch");
const answerModeButtons = answerModeSwitch.querySelectorAll("[data-answer-mode]");

const optionCodes = ["A", "B", "C", "D", "E"];
const baseScores = { A: -100, B: -50, C: 0, D: 50, E: 100 };
const dimensionTieBreakOrder = ["C", "T", "R", "E"];
const PUBLIC_SITE_URL = SJBTI_COPY.siteUrl;
const RESULT_ASSET_VERSION = "20260627a";
const preloadedResultCards = new Set();
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
  if (question.emphasis) {
    questionTitle.innerHTML = `
      <span class="question-context">${question.text}</span>
      <span class="question-emphasis">${question.emphasis}</span>
    `;
  } else {
    questionTitle.textContent = question.text;
  }
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
      if (question.id === FBTI_DATA.answerModeQuestion.id && button.dataset.value === "random") {
        app.randomResultIndex = Math.floor(Math.random() * FBTI_DATA.results.length);
      }
      optionsEl.querySelectorAll(".option-btn").forEach((optionButton) => {
        optionButton.disabled = true;
        optionButton.classList.toggle("is-selected", optionButton === button);
      });
      if (question.id === FBTI_DATA.answerModeQuestion.id && button.dataset.value === "random") {
        window.setTimeout(renderResult, 180);
        return;
      }
      window.setTimeout(() => {
        preloadLikelyResultCard();
        goNext();
      }, 180);
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
  app.randomResultIndex = null;
  app.currentResult = null;
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
  const jamesKey = label === "詹姆斯" ? (player === "梅西" ? "詹姆斯梅" : "詹姆斯罗") : null;
  return {
    player,
    label,
    imageKey: jamesKey || SJBTI_COPY.imageAliases[label] || label,
    presentationKey: jamesKey || undefined,
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

  if (app.answers.answerMode === "random" && app.randomResultIndex !== null) {
    const randomResult = FBTI_DATA.results[app.randomResultIndex] || FBTI_DATA.results[0];
    return {
      type: "random",
      introState,
      scoreRows,
      axes,
      resultKey: randomResult.key,
      normalResult: randomResult,
      final: {
        label: randomResult.label,
        player: randomResult.player,
        kind: "随机人格",
      },
      reason: "",
    };
  }

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

function sanitizeAssetName(name) {
  return String(name).replace(/[“”"']/g, "").replace(/[\\/:*?<>|]/g, "");
}

function resultCardKey(result) {
  return sanitizeAssetName(result.presentationKey || result.label);
}

function resultCardUrl(result) {
  return `./assets/result-cards/${resultCardKey(result)}.webp?v=${RESULT_ASSET_VERSION}`;
}

function loadResultCard(final, cardPlaceholder, resultCardImage) {
  const url = resultCardUrl(final);

  cardPlaceholder.classList.remove("has-image");
  resultCardImage.removeAttribute("src");
  resultCardImage.alt = `${final.label}结果卡`;
  resultCardImage.onload = () => {
    cardPlaceholder.classList.add("has-image");
  };
  resultCardImage.onerror = () => {
    cardPlaceholder.classList.remove("has-image");
  };
  resultCardImage.src = url;
  return url;
}

function preloadLikelyResultCard() {
  const answeredFormalQuestions = Object.keys(app.answers).filter((answerId) =>
    [...FBTI_DATA.questionBanks.fan, ...FBTI_DATA.questionBanks.novice].some(
      (question) => question.id === answerId,
    ),
  ).length;
  if (answeredFormalQuestions < 12 || preloadedResultCards.size >= 3) return;

  const final = getFinalResult().final;
  const url = resultCardUrl(final);
  if (preloadedResultCards.has(url) || typeof Image === "undefined") return;

  preloadedResultCards.add(url);
  const image = new Image();
  image.src = url;
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
  const presentationKey = result.final.presentationKey || result.final.label;
  const isStandardResult = result.type === "normal" || result.type === "random";
  const standardPresentation = SJBTI_COPY.standardResults[result.final.label];
  if (isStandardResult && standardPresentation) {
    const segment = getTestingSegment(result.introState);
    const descriptions = standardPresentation.descriptions;
    return {
      slogan: standardPresentation.slogan,
      description: descriptions[segment] || descriptions.fan,
      descriptions,
      segment,
      canToggleDescription: segment === "fan",
      dislikeDescription: descriptions.novice,
    };
  }

  const presentation =
    SJBTI_COPY.specialResults[presentationKey] ||
    SJBTI_COPY.specialResults[result.final.label] ||
    standardPresentation;

  if (result.type === "extreme" && presentation?.descriptions?.extreme) {
    return {
      ...presentation,
      description: presentation.descriptions.extreme,
      canToggleDescription: true,
      dislikeDescription: presentation.descriptions.extremeSoft,
      feedbackLabels: {
        likeDefault: "这是高论",
        likeSelected: "已赞，这是高论",
        dislikeDefault: "这里没有尊重",
        dislikeSelected: "已踩，换个说法",
      },
    };
  }

  if (presentation) return presentation;

  const axisText = result.axes.map((axis) => axis.side).join("与");
  return {
    slogan: "你的踢法，就是你看待比赛的方式。",
    description: `你最鲜明的倾向是${axisText}。这两种特质共同决定了你在场上的选择、节奏和表达方式。`,
  };
}

const defaultDescriptionFeedbackLabels = {
  likeDefault: "是的这就是我",
  likeSelected: "已赞，这就是我",
  dislikeDefault: "我不要面子？",
  dislikeSelected: "已踩，换个说法",
};

function getDescriptionFeedbackLabels(presentation = {}) {
  return {
    ...defaultDescriptionFeedbackLabels,
    ...(presentation.feedbackLabels || {}),
  };
}

function setFeedbackButtonState(choice, presentation = {}) {
  const labels = getDescriptionFeedbackLabels(presentation);
  app.descriptionFeedbackChoice = choice;
  feedbackLikeBtn.classList.toggle("is-selected", choice === "like");
  feedbackDislikeBtn.classList.toggle("is-selected", choice === "dislike");
  feedbackDislikeBtn.classList.add("is-negative");

  feedbackLikeBtn.querySelector(".feedback-label").textContent =
    choice === "like" ? labels.likeSelected : labels.likeDefault;
  feedbackDislikeBtn.querySelector(".feedback-label").textContent =
    choice === "dislike" ? labels.dislikeSelected : labels.dislikeDefault;
}

function lockDescriptionFeedback() {
  app.descriptionFeedbackLocked = true;
  feedbackLikeBtn.disabled = true;
  feedbackDislikeBtn.disabled = true;
}

function dismissDescriptionFeedback(delay = 850) {
  window.clearTimeout(app.descriptionFeedbackTimer);
  app.descriptionFeedbackTimer = window.setTimeout(() => {
    descriptionFeedback.classList.add("is-dismissing");
    app.descriptionFeedbackTimer = window.setTimeout(() => {
      descriptionFeedback.hidden = true;
      descriptionFeedback.classList.remove("is-dismissing");
    }, 210);
  }, delay);
}

function setResultDescription(text, animate = false) {
  window.clearTimeout(app.descriptionChangeTimer);
  resultDescriptionEl.classList.remove("is-updated");

  if (!animate) {
    resultDescriptionEl.classList.remove("is-changing");
    resultDescriptionEl.textContent = text;
    return;
  }

  resultDescriptionEl.classList.add("is-changing");
  app.descriptionChangeTimer = window.setTimeout(() => {
    resultDescriptionEl.textContent = text;
    resultDescriptionEl.classList.remove("is-changing");
    resultDescriptionEl.classList.add("is-updated");
    app.descriptionChangeTimer = window.setTimeout(() => {
      resultDescriptionEl.classList.remove("is-updated");
    }, 620);
  }, 150);
}

function setupDescriptionFeedback(presentation) {
  const targetDescription = presentation.dislikeDescription || presentation.descriptions?.novice;
  const canShow =
    presentation.canToggleDescription &&
    presentation.description &&
    targetDescription;

  descriptionFeedback.hidden = !canShow;
  descriptionFeedback.classList.remove("is-dismissing");
  feedbackLikeBtn.disabled = false;
  feedbackDislikeBtn.disabled = false;
  app.descriptionFeedbackLocked = false;
  window.clearTimeout(app.descriptionFeedbackTimer);
  setFeedbackButtonState(null, presentation);
}

function renderResult() {
  const result = getFinalResult();
  const final = result.final;
  const cardPlaceholder = document.getElementById("cardPlaceholder");
  const resultCardImage = document.getElementById("resultCardImage");
  const presentation = getResultPresentation(result);
  const resultPlayerRow = document.getElementById("resultPlayerRow");
  const hasPlayer = Boolean(final.player && final.player !== "待补球员");

  document.getElementById("resultDetailName").textContent = final.label;
  document.getElementById("resultPlayerChinese").textContent = hasPlayer ? final.player : "";
  resultPlayerRow.hidden = !hasPlayer;
  setResultDescription(presentation.description);
  setupDescriptionFeedback(presentation);

  const cardUrl = loadResultCard(final, cardPlaceholder, resultCardImage);
  renderDimensionBars(result.scoreRows);

  const playerText = hasPlayer ? ` / ${final.player}` : "";
  app.lastResultText = `我的 SJBTI 世界杯人格：${final.label}${playerText}。${presentation.slogan} ${presentation.description}`;
  app.currentResult = {
    result,
    presentation,
    cardUrl,
  };
  shareBtn.textContent = "分享网址";
  saveBtn.textContent = "保存结果";
  showScreen("result");
}

async function copyText(text) {
  if (navigator.clipboard?.writeText) {
    await navigator.clipboard.writeText(text);
    return;
  }

  const textArea = document.createElement("textarea");
  textArea.value = text;
  textArea.style.position = "fixed";
  textArea.style.opacity = "0";
  document.body.appendChild(textArea);
  textArea.select();
  document.execCommand("copy");
  textArea.remove();
}

async function shareSiteUrl() {
  try {
    await copyText(PUBLIC_SITE_URL);
    shareBtn.textContent = "网址已复制";
  } catch (error) {
    shareBtn.textContent = "复制失败";
  }
  window.setTimeout(() => {
    shareBtn.textContent = "分享网址";
  }, 1800);
}

async function buildResultCardBlob() {
  if (!app.currentResult) throw new Error("No result is available.");

  const image = document.getElementById("resultCardImage");
  if (!image.complete || !image.naturalWidth) {
    await new Promise((resolve, reject) => {
      image.addEventListener("load", resolve, { once: true });
      image.addEventListener("error", reject, { once: true });
    });
  }

  const canvas = document.createElement("canvas");
  canvas.width = image.naturalWidth;
  canvas.height = image.naturalHeight;
  const context = canvas.getContext("2d");

  context.fillStyle = "#ffffff";
  context.fillRect(0, 0, canvas.width, canvas.height);
  context.drawImage(image, 0, 0);

  return new Promise((resolve, reject) => {
    canvas.toBlob((blob) => {
      if (blob) resolve(blob);
      else reject(new Error("Unable to generate result image."));
    }, "image/png");
  });
}

async function saveResultCard() {
  saveBtn.disabled = true;
  saveBtn.textContent = "正在生成…";
  try {
    const blob = await buildResultCardBlob();
    const filename = `世界杯人格-${app.currentResult.result.final.label}.png`;
    const file = new File([blob], filename, { type: "image/png" });

    if (navigator.share && navigator.canShare?.({ files: [file] })) {
      await navigator.share({
        files: [file],
        title: "我的世界杯人格",
      });
      saveBtn.textContent = "已生成";
    } else {
      const link = document.createElement("a");
      link.href = URL.createObjectURL(blob);
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.setTimeout(() => URL.revokeObjectURL(link.href), 1000);
      saveBtn.textContent = "已保存";
    }
  } catch (error) {
    if (error?.name !== "AbortError") saveBtn.textContent = "保存失败";
  } finally {
    saveBtn.disabled = false;
    window.setTimeout(() => {
      saveBtn.textContent = "保存结果";
    }, 1800);
  }
}

document.getElementById("startBtn").addEventListener("click", startTest);
document.getElementById("restartBtn").addEventListener("click", startTest);
document.getElementById("restartMiniBtn").addEventListener("click", startTest);
document.getElementById("prevBtn").addEventListener("click", goPrev);
shareBtn.addEventListener("click", shareSiteUrl);
saveBtn.addEventListener("click", saveResultCard);
feedbackLikeBtn.addEventListener("click", () => {
  const presentation = app.currentResult?.presentation;
  if (!presentation?.canToggleDescription || app.descriptionFeedbackLocked) return;
  setFeedbackButtonState("like", presentation);
  lockDescriptionFeedback();
  dismissDescriptionFeedback();
});
feedbackDislikeBtn.addEventListener("click", () => {
  const presentation = app.currentResult?.presentation;
  if (!presentation?.canToggleDescription || app.descriptionFeedbackLocked) return;
  const targetDescription = presentation.dislikeDescription || presentation.descriptions?.novice;
  if (!targetDescription) return;
  setFeedbackButtonState("dislike", presentation);
  lockDescriptionFeedback();
  setResultDescription(targetDescription, true);
  dismissDescriptionFeedback();
});
answerModeButtons.forEach((button) => {
  button.addEventListener("click", () => {
    app.answers.answerMode = button.dataset.answerMode;
    renderQuestion();
  });
});
