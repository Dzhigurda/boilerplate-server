import { createReadStream } from "fs";
import { readFile } from "fs/promises";
import { onInit } from "../../../utilites";
import { RestAuthorizationRequest, RestFileRequest, RestRequest, ServerController } from "../../../utilites/ServerController";
import { AccessItem } from "../../user/Role/Role";
import { ArticleRepository } from "./ArticleRepository";
import { ArticleService } from "./ArticleService";

export interface RoleChecker {
  checkUserWithThrow(userId: number, access: AccessItem): void;
}

export class ArticleRestController implements onInit {
  constructor(
    private server: ServerController,
    private roleChecker: RoleChecker,
    private articleRepository: ArticleRepository,
    private articleService: ArticleService
  ) {}

  async init() {
    this.setRequestController();
    this.setCommandController();
  }

  private setRequestController() {
    this.server.getAuth("/v1/articles/:id", async (req) => this.getArticleById(req));
    this.server.getAuth("/v1/articles/", async (req) => this.getArticles(req));
    this.server.getAuth("/v1/articles/author/:id", async (req) => this.getAuthor(req));
    this.server.getAuth("/v1/articles/editor/:id", async (req) => this.getEditor(req));
    this.server.getAuth("/v1/articles/category/:id", async (req) => this.getByCategory(req));
    this.server.getAuth("/v1/articles/task/:id", async (req) => this.getByTaskID(req));
  }

  private async getArticleById(req: RestRequest & RestAuthorizationRequest) {
    this.roleChecker.checkUserWithThrow(req.payload.id, AccessItem.CAN_SEE_ARTICLE);
    const id = +req.params["id"];
    this.checkNumber(id);
    return this.articleRepository.getOne(id);
  }
  private async getArticles(req: RestRequest & RestAuthorizationRequest) {
    this.roleChecker.checkUserWithThrow(req.payload.id, AccessItem.CAN_SEE_ARTICLE);
    return this.articleRepository.getAll();
  }
  private async getAuthor(req: RestRequest & RestAuthorizationRequest) {
    this.roleChecker.checkUserWithThrow(req.payload.id, AccessItem.CAN_SEE_ARTICLE);
    const id = +req.params["id"];
    this.checkNumber(id);
    return this.articleRepository.getByAuthor(id);
  }

  private async getEditor(req: RestRequest & RestAuthorizationRequest) {
    this.roleChecker.checkUserWithThrow(req.payload.id, AccessItem.CAN_SEE_ARTICLE);
    const id = +req.params["id"];
    this.checkNumber(id);
    return this.articleRepository.getByEditor(id);
  }
  private async getByCategory(req: RestRequest & RestAuthorizationRequest) {
    this.roleChecker.checkUserWithThrow(req.payload.id, AccessItem.CAN_SEE_ARTICLE);
    const id = +req.params["id"];
    this.checkNumber(id);
    return this.articleRepository.getByCategory(id);
  }
  private async getByTaskID(req: RestRequest & RestAuthorizationRequest) {
    this.roleChecker.checkUserWithThrow(req.payload.id, AccessItem.CAN_SEE_ARTICLE);
    const id = +req.params["id"];
    this.checkNumber(id);
    return this.articleRepository.getByTask(id);
  }

  private checkNumber(num: number) {
    if (+num != num) throw new Error("Номер не число");
    if (num <= 0) throw new Error("Связь меньше или равна нулю");
  }

  private setCommandController() { 
    this.server.postAuth("/v1/articles/", async (req) => this.createArticle(req));
    this.server.patchAuth("/v1/articles/:id", async (req) => this.saveArticle(req));
    this.server.patchAuth("/v1/articles/:id/publish", async (req) => this.publishArticle(req));
    this.server.patchAuth("/v1/articles/:id/unpublish", async (req) => this.unpublishArticle(req));
    this.server.patchAuth("/v1/articles/:id/archive", async (req) => this.archiveArticle(req));
    this.server.patchAuth("/v1/articles/:id/restore", async (req) => this.restoreArticle(req)); 
    this.server.patchAuth("/v1/articles/:id/task", async (req) => this.setTaskInArticle(req));
    this.server.deleteAuth("/v1/articles/:id/task", async (req) => this.removeTaskInArticle(req));
    this.server.uploadAuth("/v1/articles/:id/image", async (req) => this.uploadImage(req));
    this.server.uploadAuth("/v1/articles/:id/cover", async (req) => this.uploadCoverImage(req));
    this.server.deleteAuth("/v1/articles/:id/cover", async (req) => this.removeCoverImage(req));
  }
 
  async createArticle(req: RestRequest & RestAuthorizationRequest) {
    this.roleChecker.checkUserWithThrow(req.payload.id, AccessItem.CAN_CREATE_ARTICLE);
    return await this.articleService.create(req.body as any);
  }
  async publishArticle(req: RestRequest & RestAuthorizationRequest) {
    const id = +req.params["id"];
    this.checkNumber(id);
    return await this.articleService.publish(id);
  }
  async unpublishArticle(req: RestRequest & RestAuthorizationRequest) {
    const id = +req.params["id"];
    this.checkNumber(id);
    return await this.articleService.unpublish(id);
  }
  async archiveArticle(req: RestRequest & RestAuthorizationRequest) {
    const id = +req.params["id"];
    this.checkNumber(id);
    return await this.articleService.archive(id);
  }
  async restoreArticle(req: RestRequest & RestAuthorizationRequest) {
    const id = +req.params["id"];
    this.checkNumber(id);
    return await this.articleService.unarchive(id);
  }

  async saveArticle(req: RestRequest & RestAuthorizationRequest) {
    const id = +req.params["id"];
    this.checkNumber(id);
    return await this.articleService.save(req.body as any);
  }
  async setTaskInArticle(req: RestRequest & RestAuthorizationRequest) {
    const id = +req.params["id"];
    const taskId = +req.body["taskId"];
    this.checkNumber(id);
    this.checkNumber(taskId);
    return await this.articleService.setTask(id, taskId);
  }
  async removeTaskInArticle(req: RestRequest & RestAuthorizationRequest) {
    const id = +req.params["id"];
    this.checkNumber(id);
    return await this.articleService.removeTask(id);
  }

  async uploadImage(req: RestRequest & RestAuthorizationRequest & RestFileRequest) {
    const id = +req.params['id'];
    this.checkNumber(id);
    const files = (req.raw as any).files.image; 
    return await this.articleService.uploadPhotoImage(id, Buffer.from(files.data));
  }

  async uploadCoverImage(req: RestRequest & RestAuthorizationRequest & RestFileRequest) {
    const id = +req.params['id'];
    this.checkNumber(id);
    const files = (req.raw as any).files.image; 
    return await this.articleService.uploadExtraLargeImage(id, Buffer.from(files.data));
  }

  async removeCoverImage(req: RestRequest & RestAuthorizationRequest) { 
    const id = +req.params['id'];
    this.checkNumber(id);
    return await this.articleService.removeExtraLargeImage(id)
  }
}