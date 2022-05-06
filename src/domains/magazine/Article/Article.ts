import { EventEmitter } from "stream";
import { Article, ArticleStatus } from "..";

export class BaseArticle {
  private id?: number;
  private title!: string;
  private description!: string;
  private text!: string;
  private keywords!: string;
  private squareImage?: string;
  private horizontalLargeImage?: string;
  private horizontalSmallImage?: string;
  private verticalLargeImage?: string;
  private verticalSmallImage?: string;
  private extraLargeImage?: string | undefined; 
  private category!: number; 
  private author?: number; 
  private editor!: number; 
  private task?: number | undefined;
  private source!: string;
  private nick!: string;
  private photographer!: string; 
  private status: ArticleStatus = "CREATED";

  static create(author: number, editor: number, task?: number) {
    const article = new BaseArticle();
    return article.restore({
      id: 0,
      title: "Новая статья",
      description: "",
      text: "",
      keywords: "",
      category: 1,
      author: author,
      editor: editor,
      task: task,
      source: "",
      nick: "",
      photographer: "",
      status: "CREATED",
    });
  }

  getId() {
    return this.id!;
  }

  getAuthor() {
    return this.author;
  }
  setAuthor(author?: number) {
    if (this.isPublished()) throw new Error("Не позволено");
    this.author = author;
  }
  getEditor() {
    return this.editor;
  }
  setEditor(editor: number) {
    if (this.isPublished()) throw new Error("Не позволено");
    this.editor = editor;
  }
  getCategory() {
    return this.category;
  }
  setCategory(category: number) {
    this.category = category;
  }
  getStatus() {
    return this.status;
  }

  getTask() {
    return this.task;
  }
  setTask(task?: number) {
    if(task === this.task) return;
    if (this.status != "CREATED") throw new Error("Не позволено"); 
    this.task = task; 
  }

  setNick(nick: string) {
    if(this.nick === nick) return;
    if (this.status != "CREATED") throw new Error("Не позволено");
    this.nick = nick;
  }

  setSource(source: string) {
    if (this.source == source) return;
    if (this.isPublished()) throw new Error("Не позволено");
    this.source = source;
  }
  setPhotographer(photographer: string) {
    if (this.photographer == photographer) return;
    this.photographer = photographer;
  }
  setKey(keywords: string) {
    if (this.keywords == keywords) return;
    this.keywords = keywords;
  }
  setText(text: string) {
    if (this.text == text) return;
    this.text = text;
  }
  setDescription(description: string) {
    if (this.description == description) return;
    this.description = description;
  }
  setTitle(title: string) {
    if (this.title.length > 200) throw new Error("Не позволено, длина больше 200 символов");
    if (this.title == title) return;
    this.title = title;
  }

  isPublished() {
    return this.status === "PUBLISHED";
  }

  publish() {
    if (this.status === "PUBLISHED") throw new Error("Не позволено");
    const oldTask = this.task;
    this.status = "PUBLISHED"; 
    // return new History().rstore({ ... });
  }

  unpublish() {
    if (this.status === "CREATED") throw new Error("Не позволено");
    const oldTask = this.task;
    this.status = "CREATED"; 
    // return new History().rstore({ ... });
  }

  archive() {
    if (this.status === "ARCHIVED") throw new Error("Не позволено");
    const oldTask = this.task;
    this.status = "ARCHIVED"; 
    // return new History().rstore({ ... });
  }

  unarchive() {
    if (this.status === "CREATED") throw new Error("Не позволено");
    const oldTask = this.task;
    this.status = "CREATED"; 
    // return new History().rstore({ ... });
  }

  setImages(sq: string, hl: string, hs: string, vl: string, vs: string) {
    this.squareImage = sq;
    this.horizontalLargeImage = hl;
    this.horizontalSmallImage = hs;
    this.verticalLargeImage = vl;
    this.verticalSmallImage = vs; 
  }

  setCover(el?: string) {
    this.extraLargeImage = el;
  }

  removeCover() {
    this.extraLargeImage = undefined;
  }

  restore(obj: Article) {
    this.id = obj.id;
    this.title = obj.title;
    this.description = obj.description;
    this.text = obj.text;
    this.keywords = obj.keywords;
    this.squareImage = obj.squareImage;
    this.horizontalLargeImage = obj.horizontalLargeImage;
    this.horizontalSmallImage = obj.horizontalSmallImage;
    this.verticalLargeImage = obj.verticalLargeImage;
    this.verticalSmallImage = obj.verticalSmallImage;
    this.extraLargeImage = obj.extraLargeImage;
    this.category = obj.category;
    this.author = obj.author;
    this.editor = obj.editor;
    this.task = obj.task;
    this.source = obj.source;
    this.nick = obj.nick;
    this.photographer = obj.photographer;
    this.status = obj.status;
    return this;
  }

  toJSON(): Article {
    return {
      id: this.id!,
      title: this.title,
      description: this.description,
      text: this.text,
      keywords: this.keywords,
      squareImage: this.squareImage,
      horizontalLargeImage: this.horizontalLargeImage,
      horizontalSmallImage: this.horizontalSmallImage,
      verticalLargeImage: this.verticalLargeImage,
      verticalSmallImage: this.verticalSmallImage,
      extraLargeImage: this.extraLargeImage,
      category: this.category,
      author: this.author!,
      editor: this.editor,
      task: this.task,
      source: this.source,
      nick: this.nick,
      photographer: this.photographer,
      status: this.status,
    };
  }
}