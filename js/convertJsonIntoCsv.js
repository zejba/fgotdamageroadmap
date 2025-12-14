import fs from 'fs'

const jsonPath = 'data/servant_data.json'
const csvPath = 'data/servant_data.csv'
const csvHeader = [
  'id',
  '鯖名',
  'レアリティ',
  'クラス',
  '副属性',
  '無聖杯',
  'Lv.120',
  '宝具色',
  '宝具倍率',
  'NA',
  'スター発生率',
  'b',
  'a',
  'q',
  'ex',
  'n',
  'クラススキル個数',
]

function convertJsonIntoCsv() {
  const jsonData = fs.readFileSync(jsonPath, 'utf-8')
  const servants = JSON.parse(jsonData)
  const csvData = [csvHeader]

  let version = 1
  for (const [index, servant] of servants.entries()) {
    if (
      index > 0 &&
      servant.collectionNo !== servants[index - 1].collectionNo
    ) {
      version = 1
    }
    let collectionNo = servant.collectionNo.toString()
    if (
      version > 1 ||
      (index + 1 < servants.length &&
        servants[index + 1].collectionNo === servant.collectionNo)
    ) {
      collectionNo = `${servant.collectionNo}-${version}`
    }
    const csvLine = convertToCsvLine(servant, collectionNo)
    csvData.push(csvLine)
    version++
  }

  // 列の長さを揃える
  const maxColumns = Math.max(...csvData.map((line) => line.length))
  const paddedData = csvData.map((line) => {
    const newLine = [...line]
    while (newLine.length < maxColumns) {
      newLine.push('')
    }
    return newLine
  })

  // CSVに書き込む
  const newCsvContent = paddedData.map((line) => line.join(',')).join('\n')
  fs.writeFileSync(csvPath, newCsvContent, 'utf-8')
}

function convertToCsvLine(servantData, collectionNo) {
  return [
    collectionNo,
    servantData.anotherVersionName
      ? `${servantData.name}(${servantData.anotherVersionName})`
      : servantData.name,
    servantData.rarity.toString(),
    servantData.className === 'moonCancer'
      ? 'mooncancer'
      : servantData.className === 'alterEgo'
      ? 'alterego'
      : servantData.className,
    servantData.attribute,
    servantData.atkMax.toString(),
    servantData.atk120.toString(),
    servantData.noblePhantasm.card[0] || 'b',
    servantData.noblePhantasm.value.toString(),
    servantData.npGain.toString(),
    servantData.starGen.toString(),
    servantData.hitCounts.buster.toString(),
    servantData.hitCounts.arts.toString(),
    servantData.hitCounts.quick.toString(),
    servantData.hitCounts.extra.toString(),
    servantData.hitCounts.np.toString(),
    servantData.classPassive.length.toString(),
    ...servantData.classPassive.flatMap((skill) => [
      typeConverter[skill.type],
      skill.value.toString(),
    ]),
  ]
}

const typeConverter = {
  atkBuff: 'atk_buff',
  busterBuff: 'b_buff',
  busterPowerBuff: 'b_power_buff',
  artsBuff: 'a_buff',
  artsPowerBuff: 'a_power_buff',
  quickBuff: 'q_buff',
  quickPowerBuff: 'q_power_buff',
  extraBuff: 'ex_buff',
  noblePhantasmBuff: 'np_buff',
  criticalBuff: 'cr_buff',
  busterCriticalBuff: 'b_cr_buff',
  artsCriticalBuff: 'a_cr_buff',
  quickCriticalBuff: 'q_cr_buff',
  damagePlus: 'damage_plus',
  npGetBuff: 'npget_buff',
  starGetBuff: 'starget_buff',
}

convertJsonIntoCsv()
