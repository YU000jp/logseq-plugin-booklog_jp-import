import '@logseq/libs';
import { getDateForPage } from 'logseq-dateutils';
import { logseq as PL } from "../package.json";
import { settingUI } from './setting';
const pluginId = PL.id;


/* main */
const main = () => {

  settingUI(); /* -setting */
  console.info(`#${pluginId}: MAIN`); /* -plugin-id */
  logseq.UI.showMsg(`add items at toolbar and contextmenu`); /* test message ==remove== */

  /* CSS */
  logseq.provideStyle(String.raw`
    div#test {
      font-size: 20px;
    }
  `);

  /* ContextMenuItem  */
  logseq.Editor.registerBlockContextMenuItem('🟢Open at right sidebar', async ({ uuid }) => {

    /* todayDateInUserFormat Sample */
    const userConfigs = await logseq.App.getUserConfigs();
    const preferredDateFormat = userConfigs.preferredDateFormat;
    const today = new Date();
    const todayDateInUserFormat = getDateForPage(today, preferredDateFormat);
    console.log(`#${pluginId}: ${todayDateInUserFormat}`);
    /* end_sample */

    logseq.App.openInRightSidebar(uuid);
    logseq.UI.showMsg("🟢Open at right sidebar");
    console.log(`#${pluginId}: 🟢Open at right sidebar`);
  });

  /* toolbarItem */
  logseq.App.registerUIItem("toolbar", {
    key: pluginId,
    template: `
    <div data-on-click="open_dashboard" style="font-size:20px">🔥</div>
    `,
  });/* For open_dashboard */

  console.info(`#${pluginId}: loaded`);
};/* end_main */


/* dashboard */
const model = {
  async open_dashboard() {
    console.info(`#${pluginId}: open_dashboard`);
    logseq.UI.showMsg(`Open dashboard`);

    //Advanced Query
    const queryScript = logseq.settings.advancedQuery;
    console.log(`#${pluginId}: queryScript ${queryScript}`); /* TODO */
    const queryResult = await logseq.DB.datascriptQuery(queryScript);
    console.log(`#${pluginId}: Advanced Query result`);
    console.log(queryResult);
    logseq.UI.showMsg(`Advanced Query`);



    /* JSON */
    const settingJsonUrl = logseq.settings.jsonUrl;
    if (settingJsonUrl != "") {
      logseq.UI.showMsg(`info: 読み込みを開始しました。しばらく時間がかかります。`);//start message
      const jsonImport = async (url) => {
        const response = await fetch(url);
        const jsonData = await response.json();
        console.log(`#${pluginId}: JSON import`);
        console.log(jsonData);
        console.log(`jsonData No.0: ` + jsonData[0]);

        //foreach JSON
        const foreachPage = await jsonData.forEach(function (item, index) {
          if (item.type === '') { item.type = "本"; }
          const createPageTitle = item.type + "/" + item.title;
          const deleteP = logseq.Editor.deletePage(createPageTitle);//no fetch
          const createP = logseq.Editor.createPage(createPageTitle, item, {
            createFirstBlock: true,
            format: "markdown",
            redirect: false
          }
          );
          console.log(`create: ` + createPageTitle);
          logseq.UI.showMsg(`create:` + createPageTitle);
        });
        //foreach JSON end

        console.log(`#${pluginId}: JSON import done`);
        logseq.UI.showMsg(`success: 作成が終わりました。`);//success message
      }
      jsonImport(settingJsonUrl);

    } else {
      console.log(`#${pluginId}: warning`);
      logseq.UI.showMsg(`warning: プラグインの設定をおこなってください。`);//warning message
    }
    console.log(`#${pluginId}: open_dashboard end`);
  }
};

logseq.ready(model, main).catch(console.error);