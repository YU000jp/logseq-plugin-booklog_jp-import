export const settingUI = () => {
    /* https://logseq.github.io/plugins/types/SettingSchemaDesc.html */
    const settingsTemplate = [
        {
            key: "jsonUrl",
            type: "string",
            default: ``,
            title: "Converted .csv to .json",
            description: `変換用サイトで、コピーしたURLを貼り付けてください。`,
        },
        {
            key: "limitTags",
            type: "string",
            default: ``,
            title: "タグで限定する",
            description: `コンマ「,」で区切ってタグを入力すると、そのタグに一致したものだけ書籍ページが作成されます。(すでに作成済みの場合は、この設定は無効です)`,
        }
    ];
    logseq.useSettingsSchema(settingsTemplate);
};