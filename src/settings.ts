import { SettingSchemaDesc } from "@logseq/libs/dist/LSPlugin.user"

/* https://logseq.github.io/plugins/types/SettingSchemaDesc.html */
export const settingsTemplate = (): SettingSchemaDesc[] => [
  {
    key: "deleteMode",
    type: "enum",
    default: "Write",
    enumChoices: ["OFF","Update", "Add", "Delete"],
    enumPicker: "radio",
    title: "追加・削除モード",
    description: "各モードを選んで📚を押すと実行します。[Update]は、すでにページが存在した場合、そのページのブロックをすべて削除し、ページを作り直します。[Add]では、ページの上書きはおこなわずに更新をおこないます。[Delete]では、ページをすべて削除します。いずれも日誌ページなどリンクした内容は消えません ",
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
]