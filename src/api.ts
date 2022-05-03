import { FakeMailPort } from "./domains/ports/FakeMailPort"; 
import { UserModule } from "./domains/user/UserModule";
import { ConfigService } from "./utilites/ConfigService";
import { FileDataAccessService } from "./utilites/FileDataAccessService";
import { MemoryDataAccessService } from "./utilites/MemoryDataAccessService";
import { ServerController } from "./utilites/ServerController";

export class API {
  constructor() {}
  async init() {
    const config = new ConfigService();
    await config.init();

    const mailPort = new FakeMailPort(config, false);
    const server = new ServerController(config);
    await server.init();

    const daService = new FileDataAccessService("../db/");

    const userModule = new UserModule(config, server, daService, mailPort);
 

    await mailPort.init();
    await userModule.init();
  }
}