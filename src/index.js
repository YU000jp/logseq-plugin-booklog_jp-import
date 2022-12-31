import "@logseq/libs";
import { logseq as PL } from "../package.json";
const pluginId = PL.id;

import { getDateForPage } from 'logseq-dateutils';
import swal from 'sweetalert';


function getIsDuplicate(arr1, arr2) {
  return [...arr1, ...arr2].filter(item => arr1.includes(item) && arr2.includes(item)).length > 0
}

/* main */
const main = () => {
  console.info(`#${pluginId}: MAIN`); /* -plugin-id */

  /* https://logseq.github.io/plugins/types/SettingSchemaDesc.html */
  const settingsTemplate = [
    {
      key: "jsonUrl",
      type: "string",
      default: ``,
      title: "ファイルkeyを貼り付けてください",
      description: "追加更新の方法について [空欄にしてから📚を押すと変換用サイトが開きます。そこにもう一度アップロードして新しいファイルkeyを貼り付けてください。次の項目で[Write]を選択して📚を押すと実行されます。既存の上書きはおこなわれません。]",
    },
    {
      key: "deleteMode",
      type: "enum",
      default: "Write",
      enumChoices: ["OFF", "Write", "Delete"],
      enumPicker: "select",
      title: "追加・削除モード",
      description: "[Delete]を選択して📚を押すと書籍の関連ページが全部削除されます。(ジャーナルページに書いた内容は消えません)",
    },
    {
      key: "listTitle",
      type: "object",
      inputAs: "hidden",
      default: "",
      title: " ",
      description: "`Edit setting.json`で作成された書籍ページの一覧をファイルで確認できます。※削除モード用のリストです。",
    },
    {
      key: "listPublisher",
      type: "object",
      inputAs: "hidden",
      default: null,
      title: null,
      description: null,
    },
    {
      key: "listAuthor",
      type: "object",
      inputAs: "hidden",
      default: null,
      title: null,
      description: null,
    },
  ];
  /*JavascriptではなくPHPで処理することにした
  , {
              key: "limitTags",
              type: "string",
              default: ``,
              title: "タグ (デフォルトは無記入)",
              description: `コンマ「,」で区切ってタグを入力する。一致したものだけ書籍ページが作成されます。(すでに作成済みの場合は、この設定は無効です)`,
          }
  ,{
      key: "limitCategory",
      type: "string",
      default: ``,
      title: "カテゴリ (デフォルトは無記入)",
      description: `コンマ「,」で区切ってカテゴリを入力する。一致したものだけ書籍ページが作成されます。(すでに作成済みの場合は、この設定は無効です)`,
  }
  */
  logseq.useSettingsSchema(settingsTemplate);

  if (logseq.settings.listTitle === "") {
    logseq.showMainUI();
    swal({
      title: "ブクログ用プラグインが読み込まれました",
      text: "ツールバーの📚ボタンを押してください",
      icon: "info",
    }).then(() => {
      logseq.hideMainUI();
    });
  }

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
  open_booklog_jp() {
    console.info(`#${pluginId}: open_booklog_jp`);

    const createContentTitle = "ブクログのリスト";
    const settingJsonUrl = logseq.settings.jsonUrl;

    if (logseq.settings.deleteMode === "Delete") {
      /*
      delete mode
      */
      if (logseq.settings.listTitle === "") {

        //delete mode && listTitle ""
        /* logseq.UI.showMsg("削除が実行できませんでした。\n\n", `error`, {
          timeout: 6000,
        }); */
        logseq.showSettingsUI();

      } else {

        //dialog
        logseq.showMainUI();
        swal({
          title: "削除を実行しますか?",
          text: "",
          icon: "info",
          buttons: true,
        })
          .then((answer) => {
            if (answer) {//OK
              swal("実行中です", "処理が終わるまでお待ちください");
              try {
                //delete page by title
                const deleteObjTitle = logseq.settings.listTitle;
                deleteObjTitle.forEach(function (value) {
                  logseq.Editor.deletePage(value);
                });
                //delete page by publisher
                const deleteObjPublisher = logseq.settings.listPublisher;
                deleteObjPublisher.forEach(function (value) {
                  logseq.Editor.deletePage(value);
                });
                //delete page by publisher
                const deleteObjAuthor = logseq.settings.listAuthor;
                deleteObjAuthor.forEach(function (value) {
                  logseq.Editor.deletePage(value);
                });
                logseq.Editor.deletePage(createContentTitle);
                logseq.updateSettings({ listTitle: "", listPublisher: "", listAuthor: "", jsonUrl: "", });//keep delete mode
              } catch (err) {
                console.log(err);
              } finally {
                logseq.showMainUI();
                swal({
                  title: "削除がおわりました",
                  text: "'reindex'をおこなってください",
                }).then(() => {
                  logseq.hideMainUI();
                });
              }
            } else {//Cancel
              //user cancel in dialog
              logseq.UI.showMsg("キャンセルしました", `info`, {
                timeout: 9000,
              });
              logseq.updateSettings({ deleteMode: "OFF" });
              logseq.showSettingsUI();
            }
          })
          .finally(() => {
            logseq.hideMainUI();
          });
        //dialog end

      }
    } else if (settingJsonUrl !== "" && (logseq.settings.deleteMode !== "Delete" && logseq.settings.deleteMode === "Write" || logseq.settings.listTitle === "")) {
      /*
      create page start
      */

      const requestJsonUrl = "http://yu000jp.php.xdomain.jp/main/booklog/logseq/" + settingJsonUrl;
      //dialog
      logseq.showMainUI();
      swal({
        title: "実行しますか?",
        text: "書籍ページを作成します",
        icon: "info",
        buttons: true,
      })
        .then((answer) => {
          if (answer) {//OK

            logseq.UI.showMsg("読み込んでいます\n処理が終わるまでお待ちください", `info`).then(() => {

              logseq.updateSettings({ deleteMode: "OFF" });

              /* JSON */
              const jsonImport = async (jsonUrl) => {
                await fetch(jsonUrl, {
                  method: 'GET',
                  headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json',
                  }
                })
                  .then((response) => {
                    if (!response.ok) {
                      return "error";
                    }
                    const create = async () => {
                      try {
                        const jsonData = await response.json();

                        //タグで限定する
                        //if (logseq.settings.limitTags != "") {
                        //  var settingTagArray = logseq.settings.limitTags.split(',');
                        //} else {
                        //  var settingTagArray = "";
                        //}

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
                        jsonData.forEach(function (item, index) {
                          if (item.title === undefined) {
                            return;
                          }
                          try {
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
                          } finally {
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
                          }
                        });//foreach done

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

                        logseq.updateSettings({ listTitle: pullDeleteList, listPublisher: pullPublisherList, listAuthor: pullAuthorList });

                      } finally {
                        //ページを移動する TODO
                        logseq.showMainUI();
                        swal({
                          title: "書籍ページの作成が終わりました",
                          text: "`インデックス再構築`をおこなってください。\n\nそのあと左メニューにある [全ページ] からページを探してください。",
                          icon: "success",
                        })
                          .then(() => {
                            logseq.hideMainUI();
                          });
                      }
                    };
                    create();
                  })
                  .catch((reason) => {
                    logseq.UI.showMsg("ERROR: ファイルkeyを確認してください", `error`, {
                      timeout: 6000,
                    });
                  });
              };
              jsonImport(requestJsonUrl);
            });

          } else {//Cancel
            //user cancel in dialog
            logseq.UI.showMsg("キャンセルしました", `info`, { timeout: 30000 });
            logseq.updateSettings({ deleteMode: "OFF" });
            logseq.showSettingsUI();
          }
        })
        .finally(() => {
          logseq.hideMainUI();
        });
      //dialog end


    } else {
      if (settingJsonUrl === "") {

        logseq.showMainUI();
        swal("OKボタンを押すと、ブラウザに2つのページが開きます。\n\nブクログのエクスポート画面(ログインが必要です)からファイルをダウンロードしてください。\n\nその次に、変換サイトにアップロードします。そのURLをコピーをして、プラグインの設定項目に貼り付けてください。\n\nツールバーの📚ボタンを押すとインポートが実行され、書籍ページが作成されます。").then(() => {
          setTimeout(function () {
            logseq.App.openExternalLink('http://yu000jp.php.xdomain.jp/main/booklog/logseq/');
            logseq.App.openExternalLink('https://booklog.jp/export');
          }, 100);
          logseq.showSettingsUI();
          logseq.hideMainUI();
        });
      } else {
        logseq.UI.showMsg("すでに作成されています");
        logseq.updateSettings({ deleteMode: "OFF" });
        logseq.showSettingsUI();
      }

    }

  }
};

logseq.ready(model, main).catch(console.error);
