import "@logseq/libs";
import { SettingSchemaDesc } from "@logseq/libs/dist/LSPlugin.user";
import { logseq as PL } from "../package.json";
import swal from 'sweetalert';
import { parse } from 'csv-parse/lib/sync';
import { create } from "./create";
import { getDateForPage } from 'logseq-dateutils';//https://github.com/hkgnp/logseq-dateutils

const pluginId = PL.id;
const createContentTitle = "ブクログのリスト";




//https://www.dkrk-blog.net/javascript/duplicate_an_array
//タグとカテゴリの指定
function getIsDuplicate(arr1, arr2) {
  return [...arr1, ...arr2].filter(itemStr => arr1.includes(itemStr) && arr2.includes(itemStr)).length > 0;
}



//https://github.com/hserranome/logseq-imgur-upload

const createDomElements = (container) => {
  // Create HTML form
  const form = document.createElement("form");
  form.classList.add("file-receive-form");
  form.innerHTML = `
		<input class="file-receive-input" name="csv" type="file" id="file-receive-input" />
		<button class="file-receive-button" id="file-receive-button" type="submit">読み込む</button>
		<div class="file-receive-message" id="file-receive-message"></div>
	`;
  container.appendChild(form);
};

const handleClose = (e) => {
  if (
    (e.type === "keydown" && e.key === "Escape") ||
    (e.type === "click" && !(e.target as HTMLElement).closest(".file-receive-wrapper"))
  ) {
    logseq.hideMainUI({ restoreEditingCursor: true });
  }
  e.stopPropagation();
};


async function postData(formData, button) {
  const UserSettings: any = await logseq.settings;
  try {
    button.disabled = true;
    button.innerText = "Uploading...";
    button.classList.add("file-receive-button-disabled");


    let dialogMessage;
    let dialogIcon;
    if (UserSettings.deleteMode === "Add") {
      dialogMessage = "書籍ページを追加します(上書きはおこなわれません)";
      dialogIcon = "info";
    } else if (UserSettings.listTitle) {
      dialogMessage = "書籍ページをいったん削除して、もう一度作成します";
      dialogIcon = "warning";
    } else {
      dialogMessage = "書籍ページを作成します";
      dialogIcon = "info";
    }

    //dialog
    await logseq.showMainUI();
    await swal({
      title: "実行しますか?",
      text: dialogMessage,
      icon: dialogIcon,
      buttons: {
        cancel: true,
        confirm: true,
      },
    })
      .then((answer) => {

        if (answer) {//OK

          logseq.UI.showMsg("読み込んでいます\n処理が終わるまでお待ちください", `info`).then(() => {

            //CSVファイルの読み込み
            const file_reader = new FileReader();
            file_reader.readAsText(formData, "Shift-JIS");
            //end
            //CSVデータをオブジェクトにする
            //file load success
            file_reader.onload = async function (e) {
              //1行目を追加
              const header = "none,item-code,ISBN,category,valuation,status,review,tags,memo,start,end,title,author,publisher,year,type,page-number\n";
              //https://csv.js.org/
              const items = await parse((header + file_reader.result).replace(/""/g, ''), {
                columns: true,
                trim: true,
              });
              //日付のユーザーフォーマット取得
              const userConfigs = await logseq.App.getUserConfigs();
              const preferredDateFormat = await userConfigs.preferredDateFormat;

              try {
                //forEach
                await items.forEach(function (item, index) {

                  //タグとカテゴリの指定
                  if (UserSettings.limitTags !== "") {
                    const duplicate = getIsDuplicate(item.tags.split(','), UserSettings.limitTags.split(',')) || undefined;
                    if (duplicate) {
                      //
                    } else {
                      delete items[index];
                      return;
                    }
                  }
                  if (UserSettings.limitCategory !== "") {
                    const duplicate = getIsDuplicate(item.category.split(','), UserSettings.limitCategory.split(',')) || undefined;
                    if (duplicate) {
                      //
                    } else {
                      delete items[index];
                      return;
                    }
                  }
                  //end

                  delete items[index].valuation;
                  delete items[index].none;
                  delete items[index].ISBN;
                  delete items[index].status;
                  if (item.memo === "") {
                    delete items[index].memo;
                  }
                  if (item.review === "") {
                    delete items[index].review;
                  }
                  if (item.year === "") {
                    delete items[index].year;
                  }
                  if (item.start === "") {
                    delete items[index].start;
                  }
                  if (item.end === "") {
                    delete items[index].end;
                  }
                  if (item.author === "") {
                    delete items[index].author;
                  }
                  if (item["page-number"] === "") {
                    delete items[index]["page-number"];
                  }
                  if (item.title !== "") {
                    items[index].title = item.title.replace(/\[/g, '「');
                    items[index].title = item.title.replace(/\]/g, '」');
                    items[index].title = item.title.replace(/\//g, '');
                    items[index].title = item.title.replace(/-/g, '');
                  }
                  if (item.start !== "") {
                    //https://www.tohoho-web.com/js/date.htm
                    items[index].start = getDateForPage(new Date(item.start), preferredDateFormat);//remove time
                    if (item.start === "[[NaN/aN/aN]]") {
                      delete items[index].start;
                    }
                  }
                  if (item.end !== "") {
                    items[index].end = getDateForPage(new Date(item.end), preferredDateFormat);//remove time
                    if (item.end === "[[NaN/aN/aN]]") {
                      delete items[index].end;
                    }
                    if (item.start !== "" && item.end === item.start) {
                      delete items[index].start;
                    }
                  }
                });//forEach end
              } finally {
                //await console.log(items);
                await create(items, UserSettings, preferredDateFormat, createContentTitle);
              }
              logseq.updateSettings({ deleteMode: "OFF" });
            };
            //file load success end

          });

        } else {//Cancel
          //user cancel in dialog
          logseq.UI.showMsg("キャンセルしました", `warning`);
          logseq.updateSettings({ deleteMode: "OFF" });
          logseq.showSettingsUI();
        }
      });
    //dialog end


  } catch (err) {
    console.log(err);
  } finally {
    (<HTMLInputElement>document.querySelector("#file-receive-input")).value = "";
    button.disabled = false;
    button.innerText = "Upload";
    button.classList.remove("file-receive-button-disabled");
    logseq.Editor.exitEditingMode();
    logseq.hideMainUI();
  }
}

const checkFileIsValid = (file) => {
  if (!file.type || !file.type.match(/csv.*/)) return "File is not an csv";
  if (file.size > 20 * 1024 * 1024) return "File is too large (20MB)"; // 20MB
  return true;
};





/* main */
const main = () => {
  const UserSettings: any = logseq.settings;
  console.info(`#${pluginId}: MAIN`); /* -plugin-id */
  /* https://logseq.github.io/plugins/types/SettingSchemaDesc.html */
  const settingsTemplate: SettingSchemaDesc[] = [
    {
      key: "deleteMode",
      type: "enum",
      default: "Write",
      enumChoices: ["OFF", "Add", "Delete"],
      enumPicker: "radio",
      title: "追加・削除モード",
      description: "各モードを選んで📚を押すと実行します。[Add]では、ページの上書きはおこなわずに更新をおこないます。[Delete]では、ページをすべて削除します。いずれもジャーナルページなどリンクした内容は消えません ",
    },
    {
      key: "limitTags",
      type: "string",
      default: ``,
      title: "タグ指定 (無記入でOKです)",
      description: `コンマ「,」で区切って複数選択。ブクログで登録したタグに一致したものだけが作成されます。(修復モードを実行すると反映されます)`,
    },
    {
      key: "limitCategory",
      type: "string",
      default: ``,
      title: "カテゴリ指定 (無記入でOKです)",
      description: `コンマ「,」で区切って複数選択。ブクログで登録したタグに一致したものだけが作成されます。(修復モードを実行すると反映されます)`,
    },
    {
      key: "listTitle",
      type: "object",
      inputAs: undefined,
      default: "",
      title: " ",
      description: "`Edit setting.json`ボタンを押すと、リストデータを確認できます(※削除モード用のリスト)",
    },
    {
      key: "listAuthor",
      type: "object",
      inputAs: undefined,
      default: null,
      title: "",
      description: "",
    },
  ];

  logseq.useSettingsSchema(settingsTemplate);

  if (!UserSettings.listTitle) {
    logseq.showMainUI();
    swal({
      title: "📚 プラグインが読み込まれました",
      text: "設定をおこないます",
      icon: "info",
      buttons: {
        cancel: false,
        confirm: true,
      },
      closeOnClickOutside: false,
    }).then(() => {
      swal({
        title: "タグ指定 (無記入でOKです)",
        text: `コンマ「,」で区切って複数選択。ブクログで登録したタグに一致したものだけが作成されます`,
        content: {
          element: "input",
          attributes: {
            value: UserSettings.limitTags,
          },
        },
      }).then((tag) => {
        if (tag) {
          logseq.updateSettings({ limitTags: tag });
        }
        swal({
          title: "カテゴリ指定 (無記入でOKです)",
          text: `コンマ「,」で区切って複数選択。ブクログで登録したタグに一致したものだけが作成されます`,
          content: {
            element: "input",
            attributes: {
              value: UserSettings.limitCategory,
            },
          },
        }).then((category) => {
          if (category) {
            logseq.updateSettings({ limitCategory: category });
          }
          swal({
            title: "設定が終わりました",
            text: "ツールバーの📚ボタンを押してください",
            icon: "info",
            buttons: {
              cancel: false,
              confirm: true,
            },
          }).then(() => {
            logseq.hideMainUI();
            logseq.updateSettings({ deleteMode: "" });
          });
        });

      });

    });
  } else {
    logseq.updateSettings({ deleteMode: "OFF" });
  }

  /* toolbar open_booklog_jp */
  logseq.App.registerUIItem("toolbar", {
    key: pluginId,
    template: `<div data-on-click="open_booklog_jp" style="font-size:20px">📚</div>`,
  }); /* For open_booklog_jp */

  console.info(`#${pluginId}: loaded`);
}; /* end_main */





let elementsCreated = false;
const container = document.createElement("div");
const docApp: any = document.getElementById("app");
docApp.appendChild(container);
container.classList.add("file-receive-wrapper");

const initUpload = () => {
  if (!elementsCreated) {
    createDomElements(container);
    elementsCreated = true;
  }
  const form: any = document.querySelector(".file-receive-form");
  const fileInput = document.querySelector("#file-receive-input");
  const submitButton = <HTMLInputElement>document.querySelector("#file-receive-button");
  const message = <HTMLInputElement>document.querySelector("#file-receive-message");

  document.addEventListener("keydown", handleClose, false);
  document.addEventListener("click", handleClose);

  const handleUpload = async (files) => {
    if (files.length === 0) return;
    message.innerText = "";
    // We only support one file at a time
    const error = checkFileIsValid(files[0]);
    if (typeof error === "string") {
      message.innerText = error;
      return;
    }
    await postData(files[0], submitButton);
  };
  form.addEventListener("submit", (event: Event) => {
    event.preventDefault();
    handleUpload((<HTMLInputElement>fileInput).files);
  });

  document.onpaste = (event) => {
    const clipboardData = event.clipboardData || (window as any).clipboardData;
    handleUpload(clipboardData.files);
  };
};



const model = {

  //click toolbar
  open_booklog_jp() {
    const UserSettings: any = logseq.settings;
    console.info(`#${pluginId}: open_booklog_jp`);


    if (UserSettings.deleteMode === "Delete") {
      /*
      delete mode
      */
      if (UserSettings.listTitle === "") {
        //タイトルリストが見つからない
        logseq.showSettingsUI();
      } else {
        //dialog
        logseq.showMainUI();
        swal({
          title: "実行しますか?",
          text: "書籍ページをすべて削除します\n(タイトル、出版社、著者の各ページが対象)",
          icon: "warning",
          buttons: {
            cancel: true,
            confirm: true,
          },
          dangerMode: true,
        })
          .then((answer) => {
            if (answer) {//OK

              logseq.UI.showMsg("読み込んでいます\n処理が終わるまでお待ちください", `info`).then(() => {
                //delete page by title
                const deleteObjTitle = UserSettings.listTitle;
                deleteObjTitle.forEach(function (value) {
                  logseq.Editor.deletePage(value);
                });
                //delete page by publisher
                const deleteObjAuthor = UserSettings.listAuthor;
                deleteObjAuthor.forEach(function (value) {
                  logseq.Editor.deletePage(value);
                });
                logseq.Editor.deletePage(createContentTitle);
                logseq.updateSettings({ listTitle: "", listAuthor: "", });//keep delete mode

              }).finally(() => {
                setTimeout(function () {
                  logseq.showMainUI();
                  swal({
                    title: "削除されました",
                    text: "'reindex'をおこなってください",
                    icon: "info",
                    buttons: {
                      cancel: false,
                      confirm: false,
                    },
                    timer: 4000,
                  }).then(() => {
                    logseq.hideMainUI();
                  });
                }, 1000);
              });
            } else {//Cancel
              //user cancel in dialog
              logseq.UI.showMsg("キャンセルしました", `warning`);
              logseq.showSettingsUI();
            }
          });
        //dialog end
        logseq.updateSettings({ deleteMode: "OFF" });
      }
    } else if (UserSettings.deleteMode === "Add" || UserSettings.deleteMode === "Write" || UserSettings.listTitle === "") {

      logseq.UI.showMsg("サイトが開きます\n\nエクスポートをおこなってください\n(データファイルのダウンロード)", `info`, { timeout: 4000 }).then(() => {
        setTimeout(function () {
          logseq.App.openExternalLink('https://booklog.jp/export');
        }, 4000);
        //CSV file receive
        Object.assign(container.style, { position: "fixed", top: "15px", left: "50vh" });
        logseq.showMainUI();
        setTimeout(() => initUpload(), 100);
      });
    } else {
      logseq.App.pushState('page', { name: createContentTitle });
      logseq.UI.showMsg("すでに作成されています");
      logseq.updateSettings({ deleteMode: "OFF" });
      logseq.showSettingsUI();
    }

  }
};

logseq.ready(model).then(main).catch(console.error);
