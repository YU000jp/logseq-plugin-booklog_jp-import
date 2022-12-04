import "@logseq/libs";
import { logseq as PL } from "../package.json";
import { getDateForPage } from 'logseq-dateutils';
import { settingUI } from "./setting";
const pluginId = PL.id;

function getIsDuplicate(arr1, arr2) {
  return [...arr1, ...arr2].filter(item => arr1.includes(item) && arr2.includes(item)).length > 0
}

/* main */
const main = () => {
  settingUI(); /* -setting */
  console.info(`#${pluginId}: MAIN`); /* -plugin-id */

  logseq.UI.showMsg(
    `ブクログ用プラグインが読み込まれました。\n\nツールバーの📚ボタンを押してください。`,
    `info`,
    { timeout: 8000 }
  ); //start message


  /* toolbarItem */
  logseq.App.registerUIItem("toolbar", {
    key: pluginId,
    template: `<div data-on-click="open_booklog_jp" style="font-size:20px">📚</div>`,
  }); /* For open_booklog_jp */



  console.info(`#${pluginId}: loaded`);
}; /* end_main */



/* dashboard */
const model = {

  //click toolbar
  async open_booklog_jp() {
    console.info(`#${pluginId}: open_booklog_jp`);

    const createContentTitle = "本/ブクログのリスト";


    if (logseq.settings.deleteMode === "Delete") {
      /*
      delete mode
      */
      if (logseq.settings.listTitle === "") {
        await logseq.UI.showMsg("削除が実行できませんでした。\n\n", `error`, {
          timeout: 6000,
        });
        logseq.updateSettings({ deleteMode: null, });
        logseq.showSettingsUI();
      } else {
        const deleteFunction = () => {
          try {
            //delete page by title
            const deleteObjTitle = logseq.settings.listTitle;
            deleteObjTitle.forEach(function (value) {
              return logseq.Editor.deletePage(value);
            });
            //delete page by publisher
            const deleteObjPublisher = logseq.settings.listPublisher;
            deleteObjPublisher.forEach(function (value) {
              return logseq.Editor.deletePage(value);
            });
            //delete page by publisher
            const deleteObjAuthor = logseq.settings.listAuthor;
            deleteObjAuthor.forEach(function (value) {
              return logseq.Editor.deletePage(value);
            });
            logseq.Editor.deletePage(createContentTitle);
            logseq.UI.showMsg("削除がおわりました。\n\n'reindex'をおこなってください。", `success`, {
              timeout: 9000,
            });
            logseq.updateSettings({ listTitle: "", listPublisher: "", listAuthor: "", });//(keep delete mode)
          } catch (err) {
            console.log(err);
          }
        };
        try {
          await logseq.UI.showMsg("削除が実行されます。\n処理が終わるまでお待ちください。\n\n", `info`, {
            timeout: 10000,
          });
        } finally {
          setTimeout(deleteFunction, 3);//seconds
        }

      }

    } else if (logseq.settings.listTitle === "" || logseq.settings.deleteMode === "Rewrite") {
      /*
      create page start
      */
      try {
        logseq.UI.showMsg("読み込んでいます。\n処理が終わるまでお待ちください。\n\n", `info`, {
          timeout: 6000,
        });
      } finally {
        /* JSON */
        const settingJsonUrl = logseq.settings.jsonUrl;
        if (settingJsonUrl != "") {
          const jsonImport = async (jsonUrl) => {
            const response = await fetch(jsonUrl, {
              method: 'GET',
              headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json',
              }
            });
            const jsonData = await response.json();
            console.log(`#${pluginId}: JSON import`);

            //console.log(`jsonData: `);
            //console.log(jsonData);
            //console.log(`jsonData No.0: `);
            //console.log(jsonData[0]);


            //タグで限定する
            //if (logseq.settings.limitTags != "") {
            //  var settingTagArray = logseq.settings.limitTags.split(',');
            //} else {
            //  var settingTagArray = "";
            //}

            //console.log(`settingTagArray: ` + settingTagArray);

            //list up
            const PageTitleList = [];
            const pullDeleteList = [];
            const PageTagsList = [];
            const PageCategoryList = [];
            const PageYearList = [];
            const PageAuthorList = [];
            const PagePublisherList = [];
            const PageTypeList = [];
            const pullAuthorList = [];

            //foreach JSON
            try {
              jsonData.forEach(function (item, index) {
                if (item.type === undefined) {
                  item.type = "本";
                }
                //ページ作成タイトル
                item.title = item.type + "/" + item.title;
                PageTitleList.push("[[" + item.title + "]]\n");
                pullDeleteList.push(item.title);
                if (item.tags !== undefined) {
                  const tagList = item.tags.split(',');
                  tagList.forEach(function (value) {
                    PageTagsList.push("[[" + value + "]]\n");
                  });
                }
                if (item.category !== undefined) {
                  PageCategoryList.push("[[" + item.category + "]]\n");
                  item.category = "[[" + item.category + "]]";
                }
                if (item.year !== undefined) {
                  PageYearList.push(item.year);//later sort
                  item.year = "[[" + item.year + "]]";
                }

                if (item.author !== undefined) {
                  PageAuthorList.push("[[" + item.author + "]]\n");
                  pullAuthorList.push(item.author);
                  item.author = "[[" + item.author + "]]";
                }
                if (item.publisher !== undefined) {
                  PagePublisherList.push(item.publisher);
                  item.publisher = "[[出版社/" + item.publisher + "]]";
                }
                if (item.type !== undefined) {
                  PageTypeList.push("[[" + item.type + "]]\n");
                  item.type = "[[" + item.type + "]]";
                }
                if (item.end !== undefined) {
                  item.end = "[[" + item.end + "]]";
                }
                //タグで限定する
                //const itemTagsArray = item.tags.split(',');
                //if (logseq.settings.limitTags !== "" && getIsDuplicate(itemTagsArray, settingTagArray) !== "") {


                //logseq.Editor.deletePage(item.title);
                //create page
                logseq.Editor.createPage(item.title, item, {
                  createFirstBlock: true,
                  format: "markdown",
                  redirect: false,
                  parent: createContentTitle,
                });
                //console.log(`create: ` + item.title);
                //logseq.UI.showMsg(`create:` + item.title);

                //} else {
                //  タグに当てはまらないケース(作成しない)
                //  console.log(`Non-create(limit tags): ` + createPageTitle);
                //}
              });//foreach done
            } catch (err) {
              console.log(err);
            }

            //listUp
            logseq.Editor.deletePage(createContentTitle);
            //create page publisher
            logseq.Editor.createPage("出版社", {
              createFirstBlock: true,
              format: "markdown",
              redirect: false,
              tags: "本",
            });
            /* todayDateInUserFormat Sample */
            const userConfigs = await logseq.App.getUserConfigs();
            const preferredDateFormat = userConfigs.preferredDateFormat;
            const today = new Date();
            const todayDateInUserFormat = getDateForPage(today, preferredDateFormat);

            const functionCreateContentPage = async () => {
              //create content page
              const blockInPage = await logseq.Editor.appendBlockInPage(createContentTitle, todayDateInUserFormat + "リスト更新", { parent: "本,読書", redirect: true });
              logseq.Editor.insertBlock(blockInPage.uuid, "タイトルリスト\n" + PageTitleList);
              logseq.Editor.insertBlock(blockInPage.uuid, "タグ一覧\n" + [...(new Set(PageTagsList))]);
              logseq.Editor.insertBlock(blockInPage.uuid, "カテゴリー\n" + [...(new Set(PageCategoryList))]);
              //sort year
              PageYearList.sort(function (first, second) {
                return first - second;
              });
              PageYearList.forEach((value, index) => {
                PageYearList[index] = " [[" + value + "]] ";
              });
              logseq.Editor.insertBlock(blockInPage.uuid, "発行年\n" + [...(new Set(PageYearList))]);
              logseq.Editor.insertBlock(blockInPage.uuid, "著者\n" + [...(new Set(PageAuthorList))]);
              const pullPublisherList = [];
              PagePublisherList.forEach((value, index) => {
                PagePublisherList[index] = "[" + value + "](出版社/" + value + ")\n";
                pullPublisherList.push("出版社/" + value);
              });
              logseq.Editor.insertBlock(blockInPage.uuid, "出版社\n" + [...(new Set(PagePublisherList))]);
              logseq.Editor.insertBlock(blockInPage.uuid, "種別\n" + [...(new Set(PageTypeList))]);

              logseq.updateSettings({ listTitle: pullDeleteList, listPublisher: pullPublisherList, listAuthor: pullAuthorList, });

              //本のページに移動する TODO



              //foreach JSON end
              console.log(`#${pluginId}: JSON import done`);
              //logseq.updateSettings({ disabled: true });//plugin off NOT
              logseq.UI.showMsg("書籍ページの作成が終わりました。\n\n*プラグインをオフにしてください。\n\n\n`reindex`をおこなってください。\n\n\nそのあと左メニューにある [全ページ] からページを探してください。\n\n", `success`, {
                timeout: 30000,
              }); //success message
            };
            setTimeout(functionCreateContentPage, 3);//seconds
          };
          jsonImport(settingJsonUrl);
        } else {
          console.log(`#${pluginId}: warning`);
          logseq.UI.showMsg(`プラグインの設定をおこなってください。\n\n\nブクログのエクスポート画面と変換用サイトがブラウザに開かれています。\n\n\nブクログからファイルをダウンロードして、それを変換用サイトにアップロードしてください。\n\n発行されたURLをコピーして、設定画面で貼り付けてください。\n\n\nそのあとツールバーの📚ボタンを押すとインポートが実行されます。`, `warning`, {
            timeout: 10000,
          }); //warning message
          logseq.App.openExternalLink('http://yu000jp.php.xdomain.jp/main/booklog/logseq/');
          logseq.App.openExternalLink('https://booklog.jp/export');
          logseq.showSettingsUI();
        }
        console.log(`#${pluginId}: open_booklog_jp end`);
      }
    } else {
      logseq.UI.showMsg("すでにページが作成されています。\n\n", `warning`, {
        timeout: 6000,
      });
      logseq.updateSettings({ deleteMode: null, });
      logseq.showSettingsUI();
    }

  }
};

logseq.ready(model, main).catch(console.error);
