function exportData() {
  if (window.confirm("CSVファイルを保存しますか?")) {
  //形式[[基本情報、ターン数],[スキル数、パッシブスキル],[クラス相性,属性相性,HP],[スキル数,スキル*n],[カード,クリ判定],[スキル数,スキル*m,...]]
    let savedata = [];
    let info = [];
    info.push(document.getElementById('servant-name').value.replace(/,/g,"，"));
    info.push(document.getElementById('servant-class').value);
    info.push(document.getElementById('servant-attr').value);
    info.push(Number(document.getElementById('servant-atk').value));
    info.push(Number(document.getElementById('craft-essence-atk').value));
    info.push(document.getElementById('np-color').value);
    info.push(Number(document.getElementById('np-mag').value));
    info.push(Number(document.getElementById('b-footprint').value));
    info.push(Number(document.getElementById('a-footprint').value));
    info.push(Number(document.getElementById('q-footprint').value));
    for (let i=0; i < 7; i++) {
      info.push(0);
    }
    const turns = document.getElementsByClassName("turn-form").length;
    info.push(turns);
    savedata.push(info);
    savedata.push(getSkillData("passive-skill"));

    for (let i=1; i<=turns; i++) {
      let t = document.getElementById("turn"+i);
      savedata.push([document.getElementById("turn"+i+"-class").value,
                    document.getElementById("turn"+i+"-attr").value,
                    Number(document.getElementById("turn"+i+"-enemy-hp").value)]);
      savedata.push(getSkillData("turn"+i+"-skill"));
      for (let j=1; j<=4; j++) {
        savedata.push([document.getElementById("turn"+i+"-card"+j+"-color").value,
                      document.getElementById("turn"+i+"-card"+j+"-cri").value,]);
        savedata.push(getSkillData("turn"+i+"-card"+j+"-skill"));
      }
    }
    var blob = new Blob([arrToStr(savedata)],{type:"text/csv"});
    var link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download ="fgodamageroadmap"+getYMD()+".csv";
    link.click();
  }
}

function getSkillData(p) {
  let skill = document.getElementById(p);
  let buffForms = [];
  let skilldata = [];
  buffForms = skill.getElementsByClassName("buff-form");
  skilldata.push(buffForms.length);
  for (let i = 0; i < buffForms.length; i++) {
    skilldata.push(buffForms[i].getElementsByClassName('skill-name')[0].value.replace(/,/g,"，"),
                   buffForms[i].getElementsByClassName('skill-type')[0].value,
                   Number(buffForms[i].getElementsByClassName('amount')[0].value),
                   Number(buffForms[i].getElementsByClassName('turn')[0].value),
                   Number(buffForms[i].getElementsByClassName('time')[0].value));
  }
  return skilldata;
}

function getYMD() {
  let date = new Date();
  return date.getFullYear()+("0"+(date.getMonth()+1)).slice(-2)+("0"+date.getDate()).slice(-2)+("0"+date.getHours()).slice(-2)+("0"+date.getMinutes()).slice(-2);
}

function arrToStr(arr) {
  let ans = "";
  arr.forEach((element,index) => {
    if (index != 0) {
      ans += "\n";
    }
    element.forEach((ele2, index2) => {
      if (index2 != 0) {
        ans += ",";
      }
      ans += ele2;
    });
  });
  return ans
}

function inportData() {
  const input = document.getElementById("upload-file");
  const file = input.files[0];
  if (typeof file !== "undefined") {
    if (file.type==="text/csv") {
      var reader = new FileReader();
      reader.readAsText(file);
      reader.addEventListener("load", function() {
        let data = reader.result;
        let arr = [];
        let list = data.split('\n');
        for (let i = 0; i < list.length; i++) {
          arr.push(list[i].split(','));
        }
        resetForm();
        document.getElementById('servant-name').value = arr[0][0];
        document.getElementById('servant-class').value = arr[0][1];
        document.getElementById('servant-attr').value = arr[0][2];
        document.getElementById('servant-atk').value = Number(arr[0][3]);
        document.getElementById('craft-essence-atk').value = Number(arr[0][4]);
        document.getElementById('np-color').value = arr[0][5];
        document.getElementById('np-mag').value = Number(arr[0][6]);
        document.getElementById('b-footprint').value = Number(arr[0][7]);
        document.getElementById('a-footprint').value = Number(arr[0][8]);
        document.getElementById('q-footprint').value = Number(arr[0][9]);

        inputSkillData("passive-skill", arr[1]);

        for (let i = 1; i <= arr[0][17]; i++) {
          addTurn();
          document.getElementById("turn"+i+"-class").value = arr[10*i-8][0];
          document.getElementById("turn"+i+"-attr").value = arr[10*i-8][1];
          document.getElementById("turn"+i+"-enemy-hp").value = Number(arr[10*i-8][2]);
          inputSkillData("turn"+i+"-skill", arr[10*i-7]);
          for (let j=1; j<=4; j++) {
            document.getElementById("turn"+i+"-card"+j+"-color").value = arr[10*i+2*j-8][0];
            document.getElementById("turn"+i+"-card"+j+"-cri").value = Number(arr[10*i+2*j-8][1]);
            inputSkillData("turn"+i+"-card"+j+"-skill", arr[10*i+2*j-7]);
          }
        }
      });
    }
  }
}

function inputSkillData(p, arrc) {
  let f = document.getElementById(p)
  for (let i = 0; i < arrc[0]; i++) {
    addForm(f.children[0], 0);
    let buffForms = f.getElementsByClassName("buff-form");
    buffForms[i].getElementsByClassName('skill-name')[0].value = arrc[i*5+1];
    buffForms[i].getElementsByClassName('skill-type')[0].value = arrc[i*5+2];
    buffForms[i].getElementsByClassName('amount')[0].value = Number(arrc[i*5+3]);
    buffForms[i].getElementsByClassName('turn')[0].value = Number(arrc[i*5+4]);
    buffForms[i].getElementsByClassName('time')[0].value = Number(arrc[i*5+5]);
  }
}