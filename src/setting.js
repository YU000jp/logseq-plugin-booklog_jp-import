export const settingUI = () => {
    /* https://logseq.github.io/plugins/types/SettingSchemaDesc.html */
    const settingsTemplate = [
        {
            key: "jsonUrl",
            type: "string",
            default: ``,
            title: "Converted .csv to .json",
            description: `変換用サイトで、コピーしたURLを貼り付けてください。`,
        }
    ];
    logseq.useSettingsSchema(settingsTemplate);
};


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