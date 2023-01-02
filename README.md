# logseq-plugin-booklog-jp-import

- Create a booklist by import from <https://booklog.jp/>

[![latest release version](https://img.shields.io/github/v/release/YU000jp/logseq-plugin-booklog-jp-import)](https://github.com/YU000jp/logseq-plugin-booklog-jp-import/releases)
[![License](https://img.shields.io/github/license/YU000jp/logseq-plugin-booklog-jp-import?color=blue)](https://github.com/YU000jp/logseq-plugin-booklog-jp-import/blob/main/LICENSE)

## what can  do

- This plugin processes the content of data exported by [`booklog.jp`](https://booklog.jp/). it's a site from Japan.
- Load a exported file and create pages. Configure page properties.
- ブクログのファイルエクスポートを利用し、Logseqにブックリストを作成するプラグイン

![1671524194426-obuckt1IHU](https://user-images.githubusercontent.com/111847207/209885720-9704c0aa-fbec-4f86-9a47-5687966a9898.png)

## プラグインをつかう手順

1. Logseqマーケットプレイスからプラグインをインストールする (`booklog-jp-import`で探す)
1. ツールバーにある📚を押す (ブラウザに2つのページが開く)
1. ブクログからCSVファイルを取得する(ダウンロード) <https://booklog.jp/export>
1. <http://yu000jp.php.xdomain.jp/main/booklog/logseq/> にファイルをアップロードして、ファイルkeyをコピー
1. ファイルkeyを貼り付ける
1. ツールバーにある📚を押す(書籍タイトルページの作成が実行される。`本/〇〇〇〇`という形式)

## 読書記録をつける

1. Logseqにログを書き足すには、ジャーナルに書く (書籍のタイトルページには書かないようにしてください)
1. タグ`#[[本/〇〇〇〇]]`を使って入れ子にしてリンクをつける

### Credit

- <https://github.com/hkgnp/logseqplugin-basic-template>
- [icooon-mono.com](https://icooon-mono.com/11122-%e3%81%88%e3%82%93%e3%81%b4%e3%81%a4%e4%bb%98%e3%81%8d%e3%81%ae%e3%83%8e%e3%83%bc%e3%83%88%e3%82%a2%e3%82%a4%e3%82%b3%e3%83%b3/)

---

<a href="https://www.buymeacoffee.com/yu000japan" target="_blank"><img src="https://cdn.buymeacoffee.com/buttons/v2/default-violet.png" alt="🍌Buy Me A Coffee" style="height: 42px;width: 152px" ></a>
