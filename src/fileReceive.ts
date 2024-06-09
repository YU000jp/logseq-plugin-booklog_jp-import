import { container, postData } from "."
import "@logseq/libs"
let elementsCreated = false

//Credit: https://github.com/hserranome/logseq-imgur-upload

export const initUpload = () => {
  if (!elementsCreated) {
    createDomElements(container)
    elementsCreated = true
  }
  const form = document.querySelector(".file-receive-form") as HTMLFormElement | null
  if(!form) return
  const fileInput = document.querySelector("#file-receive-input") as HTMLInputElement | null
  if(!fileInput) return
  const submitButton = <HTMLInputElement>document.querySelector("#file-receive-button") as HTMLInputElement | null
  if(!submitButton) return
  const message = <HTMLInputElement>document.querySelector("#file-receive-message") as HTMLInputElement | null
  if(!message) return

  document.addEventListener("keydown", handleClose, false)
  document.addEventListener("click", handleClose)

  const handleUpload = async (files) => {
    if (files.length === 0) return
    message.innerText = ""
    // We only support one file at a time
    const error = checkFileIsValid(files[0])
    if (typeof error === "string") {
      message.innerText = error
      return
    }
    await postData(files[0], submitButton)
  }
  
  form.addEventListener("submit", (event: Event) => {
    event.preventDefault()
    handleUpload((<HTMLInputElement>fileInput).files)
  })

  document.onpaste = (event) => {
    const clipboardData = event.clipboardData || (window as any).clipboardData
    handleUpload(clipboardData.files)
  }
}

const createDomElements = (container) => {
  // Create HTML form
  const form = document.createElement("form")
  form.classList.add("file-receive-form")
  form.innerHTML = `
		<input class="file-receive-input" name="csv" type="file" id="file-receive-input" />
		<button class="file-receive-button" id="file-receive-button" type="submit">読み込む</button>
		<div class="file-receive-message" id="file-receive-message"></div>
	`
  container.appendChild(form)
}

export const handleClose = (e) => {
  if ((e.type === "keydown"
    && e.key === "Escape") ||
    (e.type === "click"
      && !(e.target as HTMLElement).closest(".file-receive-wrapper")))
    logseq.hideMainUI({ restoreEditingCursor: true })
  e.stopPropagation()
}

export const checkFileIsValid = (file) => {
  if (!file.type || !file.type.match(/csv.*/))
    return "File is not an csv"
  if (file.size > 20 * 1024 * 1024)
    return "File is too large (20MB)" // 20MB
  return true
}

export function csvFileReceive() {
  Object.assign(container.style, { position: "fixed", top: "15px", left: "50vh" })
  logseq.showMainUI()
  setTimeout(() => initUpload(), 100)
}
