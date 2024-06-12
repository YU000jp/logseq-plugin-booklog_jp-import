//https://www.dkrk-blog.net/javascript/duplicate_an_array
import "@logseq/libs"
import { IAsyncStorage } from "@logseq/libs/dist/modules/LSPlugin.Storage"
const fileReader = new FileReader()

//タグとカテゴリの指定
export const getIsDuplicate = (arr1, arr2) => [...arr1, ...arr2].filter(itemStr => arr1.includes(itemStr) && arr2.includes(itemStr)).length > 0

/**
 * Retrieves the cover file for a book based on its ISBN.
 * @param isbn - The ISBN of the book.
 * @param title - The title of the book.
 * @returns A Promise that resolves to the path of the cover file.
 */
export const getCoverFileFromIsbn = async (isbn: string, title: string, storage: IAsyncStorage): Promise<string> => {
    let propertyCover = ""
    console.log("ISBN: " + isbn)
    let name = isbn + ".jpg"
    if (await storage.hasItem(name) as boolean) { //チェック
        console.log("Image found in storage")
        return `![${name}](../assets/storages/${logseq.baseInfo.id}/${name})\n` //アセットに保存済みの場合
    } else {
        const response = await fetch(`https://www.googleapis.com/books/v1/volumes?q=isbn:${isbn}`)
        const data = await response.json() as { items: any[] }
        if (data.items) {
            const selectedBook = data.items.find((item) =>// 選択された書籍の情報を取得
                item.volumeInfo.industryIdentifiers && (
                    item.volumeInfo.industryIdentifiers[1]?.identifier === isbn // ISBN-13
                    || item.volumeInfo.industryIdentifiers[0]?.identifier === isbn// ISBN-10
                ))
            if (selectedBook
                && selectedBook.volumeInfo.imageLinks
                && selectedBook.volumeInfo.imageLinks.thumbnail) { // Google Books APIから取得できた場合
                console.log("Image found in Google API")
                propertyCover = await saveImageToStorage(name, selectedBook.volumeInfo.imageLinks.thumbnail, storage)
            } else  // 取得できなかった場合
                // 国立国会図書館サーチが提供する書影APIから取得
                // https://ndlsearch.ndl.go.jp/thumbnail/[isbn].jpg
                propertyCover = await fetchCoverFromNdlAPI(isbn, name, storage)
        } else
            console.log("No data found")
        if (propertyCover)
            console.log(propertyCover)
        await new Promise((resolve) => setTimeout(resolve, 1200)) // 1200ms wait
    }
    return propertyCover
}

/**
 * Saves the cover image to the storage.
 * @param name The name under which the image will be stored in the storage.
 * @param coverUrl The URL of the cover image.
 * @param storage The storage object where the image will be stored.
 * @returns A Promise that resolves to the path of the cover image.
 */
const saveImageToStorage = async (name: string, coverUrl: string, storage: IAsyncStorage): Promise<string> => {
    //画像をアセットに保存
    await fetchCoverImageToStorage(coverUrl, storage, name)
    console.log("Saved the image in storage")
    if (await storage.hasItem(name) as boolean)
        return `![${name}](../assets/storages/${logseq.baseInfo.id}/${name})\n`
    else
        return "" //画像保存失敗
}

/**
 * Fetches the cover image from the provided URL and saves it in the storage.
 * @param coverUrl The URL of the cover image.
 * @param storage The storage object where the image will be stored.
 * @param name The name under which the image will be stored in the storage.
 */
const fetchCoverImageToStorage = async (coverUrl: string, storage: IAsyncStorage, name: string): Promise<void> => {
    const blob = await fetch(coverUrl).then(response => response.blob())
    if (!blob) {
        console.error("Failed to fetch the image")
        return
    }
    fileReader.onload = () => storage.setItem(name, fileReader.result as string)
    fileReader.readAsArrayBuffer(blob)
}

/**
 * Fetches the cover image from the National Diet Library API and stores it in the provided storage.
 * @param isbn The ISBN of the book.
 * @param name The name under which the image will be stored in the storage.
 * @param storage The storage object where the image will be stored.
 * @returns A Promise that resolves to the path of the cover image.
 */
const fetchCoverFromNdlAPI = async (isbn: string, name: string, storage: IAsyncStorage): Promise<string> => {
    const ndlCover = `https://ndlsearch.ndl.go.jp/thumbnail/${isbn}.jpg`
    //fetchで画像が取得できるか確認
    const response = await fetch(ndlCover) as Response
    if (response.ok) {
        console.log("Image found in NDL API")
        return await saveImageToStorage(name, ndlCover, storage)
    } else {
        console.log("No image found")
        return ""
    }
}