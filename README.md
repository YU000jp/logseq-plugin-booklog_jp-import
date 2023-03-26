# logseq-plugin-booklog-jp-import

- Create a booklist by import from <https://booklog.jp/>

[![latest release version](https://img.shields.io/github/v/release/YU000jp/logseq-plugin-booklog-jp-import)](https://github.com/YU000jp/logseq-plugin-booklog-jp-import/releases)
[![License](https://img.shields.io/github/license/YU000jp/logseq-plugin-booklog-jp-import?color=blue)](https://github.com/YU000jp/logseq-plugin-booklog-jp-import/blob/main/LICENSE)

## what can  do

- This plugin processes the content of data exported by [`booklog.jp`](https://booklog.jp/). it's a site from Japan.
- Load a exported file and create pages. Configure page properties.
- ブクログのエクスポートファイルををもとに、まとめて書籍のタイトルページを作成するプラグイン

![1671524194426-obuckt1IHU](https://user-images.githubusercontent.com/111847207/209885720-9704c0aa-fbec-4f86-9a47-5687966a9898.png)

## Release log

> 2023/01/07
> 
> ![image](https://user-images.githubusercontent.com/111847207/211145904-b9595ae3-c33b-46f4-aaf7-fc75cbf12107.png)
> 
> 最新バージョン(ver.2.0.1)で手順を大きく変更しました
>
> Logseqの画面内でアップロードできるようになりました
>
>「更新を確認」を押して、プラグインの更新をおこなってください

## インストールと使い方

### マーケットプレースからインストール

- 右上ツールバーの[---]を押し、[プラグイン]を開く
- マーケットプレースを選択する
- 検索欄に`booklog`と入力し、検索結果から選び、インストールする

### ブクログのCSVファイルからインポートする

1. 右上ツールバーにある📚を押す
1. プラグインによって、ブラウザにブクログのサイトが開く
1. ブクログからCSVファイルをダウンロードする <https://booklog.jp/export>
1. Logseqに、ファイルのアップロードをおこなう
1. `本/タイトル`という形式のタイトルで書籍ページが作成される

### 読書メモをとる

- ジャーナルなどの他のページからからリンクやタグ(`#[[本/〇〇〇〇]]`)をつけて、入れ子にする

- タイトルページに直接書く (日付リンクをつけたほうが、後からいつ書いたのかが分かるので便利です)

- タイトルページの子ページを作成し、そのページに書く (子ページの例：`本/タイトル/感想`)

## 備考

### プラグインによって作成されるページ

- `ブクログのリスト`というページに、ページリストが表示されます

- 各タイトルページ (`本/タイトル`のような形式)

### 注意事項

- 自動同期ではありません。ブクログから手動でダウンロードする必要があります。ファイルを読み取り、そのデータを取り込みます

### データベースの情報について

- ブクログからエクスポートされた書籍情報を取得しています。発売日などの項目は確定情報とは異なる場合があります

### Credit

- <https://github.com/hkgnp/logseqplugin-basic-template>
- [icooon-mono.com](https://icooon-mono.com/11122-%e3%81%88%e3%82%93%e3%81%b4%e3%81%a4%e4%bb%98%e3%81%8d%e3%81%ae%e3%83%8e%e3%83%bc%e3%83%88%e3%82%a2%e3%82%a4%e3%82%b3%e3%83%b3/)

---

<a href="https://www.buymeacoffee.com/yu000japan" target="_blank"><img src="https://cdn.buymeacoffee.com/buttons/v2/default-violet.png" alt="🍌Buy Me A Coffee" style="height: 42px;width: 152px" ></a>
