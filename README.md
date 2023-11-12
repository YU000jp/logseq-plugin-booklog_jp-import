# Logseq Plugin: booklog-jp-import

- Create a booklist by import from <https://booklog.jp/>

⚠️非推奨
> > 書影カバー画像が取得できないことが多くなってしまいました。その代替手段が見つかりません。現在は一部、カバー画像なしでの利用になります。

[![latest release version](https://img.shields.io/github/v/release/YU000jp/logseq-plugin-booklog-jp-import)](https://github.com/YU000jp/logseq-plugin-booklog-jp-import/releases)
[![License](https://img.shields.io/github/license/YU000jp/logseq-plugin-booklog-jp-import?color=blue)](https://github.com/YU000jp/logseq-plugin-booklog-jp-import/blob/main/LICENSE)

- This plugin processes the content of data exported by [`booklog.jp`](https://booklog.jp/). (The site from Japan)
- Load a exported file and create pages. Configure page properties.
- ブクログのエクスポートファイルををもとに、まとめて書籍名のページを作成するプラグインです。
> 自動同期ではありません。ブクログから手動でダウンロードする必要があります。そのファイルを読み取り、書籍データを取り込みます

![1671524194426-obuckt1IHU](https://user-images.githubusercontent.com/111847207/209885720-9704c0aa-fbec-4f86-9a47-5687966a9898.png)

## インストールと使い方

### マーケットプレースからインストール

- 右上ツールバーの[---]を押し、[プラグイン]を開く
- マーケットプレースを選択する
- 検索欄に`booklog`と入力し、検索結果から選び、インストールする

![image](https://user-images.githubusercontent.com/111847207/229358791-e69e97d4-096d-409a-b572-d8a34a94c39d.png)

### ブクログのCSVファイルからインポートする

1. 右上ツールバーにある📚を押す
1. プラグインによって、ブラウザにブクログのサイトが開く
1. ブクログからCSVファイルをダウンロードする <https://booklog.jp/export>
1. Logseqに、ファイルのアップロードをおこなう
1. `本/書籍名`という形式で書籍名のページがプラグインによって作成される

### 読書メモをとる

- 日誌などの他のページからからリンクやタグ(`#[[本/〇〇〇〇]]`)をつけて、入れ子にする

- 書籍名ページに直接書く (日付リンクをつけたほうが、後からいつ書いたのかが分かるので便利です)

- サブページを作成し、そのページに書く (例：`本/タイトル/感想`)

## 備考

### プラグインによって作成されるページ

- `ブクログのリスト`というページに、ページリストが表示されます

- 各書籍名のページ (`本/書籍名`のような形式)

### データベースの情報について

- ブクログから手動エクスポートした書籍情報を利用します。発売日などの項目は確定情報とは異なる場合があります

## Credit

- [icooon-mono.com](https://icooon-mono.com/11122-%e3%81%88%e3%82%93%e3%81%b4%e3%81%a4%e4%bb%98%e3%81%8d%e3%81%ae%e3%83%8e%e3%83%bc%e3%83%88%e3%82%a2%e3%82%a4%e3%82%b3%e3%83%b3/)
