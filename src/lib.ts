//https://www.dkrk-blog.net/javascript/duplicate_an_array
import "@logseq/libs"
import { IAsyncStorage } from "@logseq/libs/dist/modules/LSPlugin.Storage"

//タグとカテゴリの指定
export const getIsDuplicate = (arr1, arr2) => [...arr1, ...arr2].filter(itemStr => arr1.includes(itemStr) && arr2.includes(itemStr)).length > 0

export const getCoverFileFromIsbn = async (isbn: string, title: string): Promise<string> => {
    let propertyCover = ""
    console.log("getCoverFileFrom ISBN: " + isbn)
    const response = await fetch(`https://www.googleapis.com/books/v1/volumes?q=isbn:${isbn}`)
    const data = await response.json() as { items: any[] }
    if (data.items) {
        const selectedBook = data.items.find((item) =>// 選択された書籍の情報を取得
            item.volumeInfo.industryIdentifiers[1]!.identifier === isbn // ISBN-13
            || item.volumeInfo.industryIdentifiers[0]!.identifier === isbn)  // ISBN-10
        if (!selectedBook) {
            console.log("No match found")
            return propertyCover
        }
        if (selectedBook.volumeInfo.imageLinks
            && selectedBook.volumeInfo.imageLinks.thumbnail) {
            const storage = logseq.Assets.makeSandboxStorage() as IAsyncStorage
            let name = title + ".jpg" //For Google Books API
            if (await storage.hasItem(name) as boolean) { //チェック
                propertyCover += `![${name}](../assets/storages/${logseq.baseInfo.id}/${name})\n` //アセットに保存済みの場合
                console.log("Image found in storage")
            } else {
                //画像をアセットに保存
                const blob = await fetch(selectedBook.volumeInfo.imageLinks.thumbnail).then(response => response.blob())
                const fileReader = new FileReader()
                fileReader.onload = () => storage.setItem(name, fileReader.result as string)
                fileReader.readAsArrayBuffer(blob)
                propertyCover += `![${name}](../assets/storages/${logseq.baseInfo.id}/${name})\n`
                console.log("Image found in Google Books API and saved in storage")
            }
        } else
            console.log("No image found")
    } else
        console.log("No data found")
    if (propertyCover) console.log(propertyCover)
    console.log("getCoverFileFrom ISBN: end")
    await new Promise((resolve) => setTimeout(resolve, 1200)) // 1200ms wait
    return propertyCover
}