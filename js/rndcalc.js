function addRndResultRow(length) {
  const parent = document.getElementById('rndc-result')
  const element = document.getElementsByClassName('rndc-result-form')
  for (let i = element.length - 1; i > 0; i--) {
    element[i].remove()
  }
  for (let i = 2; i <= length; i++) {
    const clone = element[0].cloneNode(true)
    clone.children[0].textContent = i
    parent.appendChild(clone)
  }
}

function addRow() {
  const target = document.getElementById('rndex')
  const parent = target?.parentElement
  const element = document
    ?.getElementById('rndform-template')
    ?.content.cloneNode(true)
  const recordLength = document.getElementsByClassName('rndr').length
  if (recordLength < 8) {
    element.children[0].children[0].textContent = cardNo[recordLength]
    parent.insertBefore(element, target)
  }
}

const cardNo = ['①', '②', '③', '④', '⑤', '⑥', '⑦', '⑧', 'Ⓔ']
const cardNoBlack = ['➊', '➋', '➌', '➍', '➎', '➏', '➐', '➑', '🅔']

function rndCalc() {
  const cardColors = document.getElementsByName('card-select')
  const recordLength = cardColors.length
  const starRates = document.getElementsByName('sr')
  const dsrs = document.getElementsByName('dsr')
  const hitCounts = document.getElementsByName('hit-count')
  const cardBuffs = document.getElementsByName('card-buff')
  const starBuffs = document.getElementsByName('star-buff')
  const isCriticals = document.getElementsByName('critical')
  const beforeAdditionals = document.getElementsByName(
    'before-additional-effect'
  )
  const afterAdditionals = document.getElementsByName('after-additional-effect')
  const damageJudgeCounts = document.getElementsByName('damage-judge')
  const isRequireds = document.getElementsByName('select-required')
  const isExEnabled = cardColors[recordLength - 1].checked
  const inputCards = []
  let result = []
  const checkableRnds = Array(100)
  for (let i = 0; i < 100; i++) {
    checkableRnds[i] = []
  }
  for (let i = 0; i < recordLength; i++) {
    inputCards.push({
      cardColor: String(cardColors[i].value),
      starRate: Number(starRates[i].value),
      dsr: Number(dsrs[i].value),
      hitCount: Number(hitCounts[i].value),
      cardBuff: Number(cardBuffs[i].value),
      starBuff: Number(starBuffs[i].value),
      isCritical: Boolean(isCriticals[i].checked),
      beforeAdditionalCount: Number(beforeAdditionals[i].value),
      afterAdditionalCount: Number(afterAdditionals[i].value),
      damageJudgeCount: Number(damageJudgeCounts[i].value),
      isRequired: Boolean(isRequireds[i].checked),
    })
  }

  for (let card1 = 0; card1 < recordLength - 1; card1++) {
    for (let card2 = 0; card2 < recordLength - 1; card2++) {
      if (card1 === card2) {
        continue
      }
      for (let card3 = 0; card3 < recordLength - 1; card3++) {
        if (card1 === card3 || card2 === card3) {
          continue
        }
        const thisPatternResult = []
        const headerText =
          cardNo[card1] +
          cardNo[card2] +
          cardNo[card3] +
          (isExEnabled ? cardNo[cardNo.length - 1] : '')
        thisPatternResult.push(headerText)
        const firstBonus =
          inputCards[card1].cardColor.charAt(0) == 'q' ||
          (inputCards[card1].cardColor !== inputCards[card2].cardColor &&
            inputCards[card2].cardColor !== inputCards[card3].cardColor &&
            inputCards[card3].cardColor !== inputCards[card1].cardColor)
            ? 0.2
            : 0

        const selectedCards = [card1, card2, card3, recordLength - 1]
        let thisPatternSum = 0

        for (let cardIndex = 0; cardIndex < 4; cardIndex++) {
          const recordIndex = selectedCards[cardIndex]
          let cardType =
            inputCards[recordIndex].cardColor.charAt(1) == 'n'
              ? 'np'
              : cardIndex === 3
              ? 'ex'
              : 'normal'
          let starCorrectionValue = 0
          if (cardType == 'ex') {
            starCorrectionValue = 1
          }
          if (inputCards[recordIndex].cardColor.charAt(0) == 'q') {
            starCorrectionValue = 0.8
            if (cardType == 'normal') {
              starCorrectionValue += 0.5 * cardIndex
            }
          }
          if (inputCards[recordIndex].cardColor.charAt(0) == 'b') {
            starCorrectionValue = 0.1
            if (cardType == 'normal') {
              starCorrectionValue += 0.05 * cardIndex
            }
          }
          const starRate = inputCards[recordIndex].starRate / 100
          const dsr = inputCards[recordIndex].dsr / 100
          const hit = inputCards[recordIndex].hitCount
          const cardbuff = inputCards[recordIndex].cardBuff / 100
          const stargetbuff = inputCards[recordIndex].starBuff / 100
          const cr =
            cardType == 'normal' && inputCards[recordIndex].isCritical ? 2 : 1
          let rndCount = 0
          let damageJudgeCount = inputCards[recordIndex].damageJudgeCount
          const totalStarRate =
            hit == 0 || damageJudgeCount == 0
              ? 0
              : starGetCalc(
                  starRate,
                  starCorrectionValue,
                  cardbuff,
                  firstBonus,
                  dsr,
                  stargetbuff,
                  cr,
                  hit,
                  0
                )[2]
          const starRnd =
            totalStarRate <= 0
              ? 0
              : totalStarRate <= 1
              ? 1
              : totalStarRate <= 2
              ? 2
              : 3
          // ダメージ判定
          rndCount += damageJudgeCount
          // 星判定
          const starJudgeCount = starRnd * hit
          rndCount += starJudgeCount
          // 追加判定
          rndCount +=
            inputCards[recordIndex].beforeAdditionalCount +
            inputCards[recordIndex].afterAdditionalCount

          if (cardType == 'normal') {
            // クリティカル判定
            rndCount += 1
          }
          if (cardType == 'np') {
            // 謎消費1
            rndCount += 1
            if (damageJudgeCount != 0) {
              // 補助宝具でなければダメージ成功判定(謎消費2)
              rndCount += 1
            }
          }
          // EXのチェックがオフなら0にする
          const isDisabledEx = cardIndex === 3 && !isExEnabled
          if (isDisabledEx) {
            rndCount = 0
          }
          thisPatternResult.push(
            isDisabledEx ? 0 : Math.trunc(totalStarRate * 1000) / 10
          )
          thisPatternResult.push(rndCount)
          thisPatternResult.push(starJudgeCount)
          thisPatternSum += rndCount
          if (isDisabledEx) {
            continue
          }
          // 最後のダメージ判定の位置
          const lastDamageRnd =
            thisPatternSum -
            inputCards[recordIndex].afterAdditionalCount -
            starJudgeCount
          for (let i = damageJudgeCount; i > 0; i--) {
            const cardIndexText =
              cardIndex === 0
                ? '1st'
                : cardIndex === 1
                ? '2nd'
                : cardIndex === 2
                ? '3rd'
                : 'EX'
            const newHeader = headerText.replace(
              headerText.charAt(cardIndex),
              cardNoBlack[cardNo.indexOf(headerText.charAt(cardIndex))]
            )
            checkableRnds[lastDamageRnd - i + 1].push(
              `${newHeader} ${cardIndexText}-${i}`
            )
          }
        }
        thisPatternResult.push(thisPatternSum)
        result.push(thisPatternResult.concat())
      }
    }
  }
  for (let recordIndex = 0; recordIndex < recordLength - 1; recordIndex++) {
    if (inputCards[recordIndex].isRequired) {
      result = result.filter(
        (ele) => String(ele[0]).indexOf(cardNo[recordIndex]) != -1
      )
    }
  }
  if (document.getElementById('sort-check')?.checked) {
    result.sort((a, b) => Number(a[13]) - Number(b[13]))
  }
  const showStarRnds = Boolean(document.getElementById('star-check')?.checked)
  addRndResultRow(result.length)
  let target = document.getElementsByName('rndcresult')
  for (let i = 0; i < result.length; i++) {
    let res1 = result[i][2]
    let res2 = result[i][5]
    let res3 = result[i][8]
    let res4 = result[i][11]
    if (showStarRnds) {
      res1 += '(' + result[i][3] + ')'
      res2 += '(' + result[i][6] + ')'
      res3 += '(' + result[i][9] + ')'
      res4 += '(' + result[i][12] + ')'
    }
    target[i * 10].textContent = result[i][0]
    target[i * 10 + 1].textContent = res1
    target[i * 10 + 2].textContent = res2
    target[i * 10 + 3].textContent = res3
    target[i * 10 + 4].textContent = res4
    target[i * 10 + 5].textContent = result[i][1] + '%'
    target[i * 10 + 6].textContent = result[i][4] + '%'
    target[i * 10 + 7].textContent = result[i][7] + '%'
    target[i * 10 + 8].textContent = result[i][10] + '%'
    target[i * 10 + 9].textContent = result[i][13]
  }
  const parent = document.getElementById('checkable-rnds')
  parent.innerHTML = ''
  for (let i = 0; i < 100; i++) {
    for (const checkableRnd of checkableRnds[i]) {
      let li = document.createElement('li')
      li.innerHTML = `${i}: ${checkableRnd}`
      parent.appendChild(li)
    }
  }
}
