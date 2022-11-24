export const settingUI = () => {
    /* https://logseq.github.io/plugins/types/SettingSchemaDesc.html */
    const settingsTemplate = [
        {
            key: "advancedQuery",
            type: "string",
            inputAs: 'textarea',
            default:
`[:find (pull ?e [*]) 
:where
[?e :block/marker ?m]
[(contains? #{"DOING"} ?m)]]`,
            title: "Customize advanced-query",
            description: ``,
        },
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