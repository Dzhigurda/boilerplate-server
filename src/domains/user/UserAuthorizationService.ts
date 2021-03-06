import { User, UserRepository } from ".";
import { MailPort } from "../ports/MailPort";
import { ContactsRepository } from "./Contact/ContactsRepository";

import { UserError } from "./Error";
import { NotificationService } from "./NotificationService";
import { AccessItem } from "./Role/Role";
import { UserAuthorizationService } from "./services";
import { UserVerefyStrategy } from "./Verify/UserVerefyStrategy";
import { VerifyType } from "./Verify/UserVerifyRecord";

export interface RoleChecker {
  checkUserWithThrow(userId: number, access: AccessItem): void;
}

export class FakeMMUserAuthorizationService
  implements UserAuthorizationService
{
  constructor(
    private repository: UserRepository,
    private verifyStrategy: UserVerefyStrategy,
    private roleChecker: RoleChecker,
    private notify: NotificationService
  ) {}
  async init() {
    // TODO create first user
  }
  async create(login: string, password: string): Promise<User> {
    if (!login) throw new UserError("Нет логина");
    if (!password) throw new UserError("Нет пароля");
    const user = await this.repository.create({ login, sol: "", hash: "" });
    user.setPasword(password);
    await this.repository.save(user);
    await this.verifyStrategy.sendCode(user.getId(), VerifyType.LOGIN);
    return user;
  }
  async changeRole(
    userId: number,
    roleId: number,
    initiator: number
  ): Promise<User> {
    const user = this.repository.getOne(userId);
    if (user.getRole() === roleId) return user;
    this.roleChecker.checkUserWithThrow(initiator, AccessItem.CAN_CHANGE_ROLE);
    if (initiator === userId)
      throw new UserError(
        "Этот метод не предназначен для редактирования самого себя"
      );
    user.setRole(roleId);
    await this.repository.save(user);
    return user;
  }

  async upgradeTrainee(userId: number): Promise<void> {
    const trainee = this.repository.getOne(userId);
    if (!trainee.isTrainee()) return;
    trainee.setRole(3);
    await this.repository.save(trainee);
    await this.notify.send(
      userId,
      "Поздравляем с повышением",
      "Ваша роль в нашем журнале повышена до Журналиста"
    );
  }
  async tryToRemindUsersAccess(login: string): Promise<void> {
    const user = this.repository.getByLogin(login);
    await this.verifyStrategy.sendCode(user.getId(), VerifyType.REMIND);
  }

  async remindPassword(
    userId: string,
    code: string,
    password: string
  ): Promise<void> {
    if (
      !(await this.verifyStrategy.checkCode(code, +userId, VerifyType.REMIND))
    )
      throw new UserError("It's not match");
    await this.changePassword(+userId, password);
  }

  async changePassword(userId: number, password: string): Promise<void> {
    const user = this.repository.getOne(userId);
    user.setPasword(password);
    await this.repository.save(user);
  }

  // need transaction
  async delete(userId: number): Promise<boolean> {
    const user = this.repository.getOne(userId);
    // Удалить все контакты в транзакции, все пометки о верефикации
    return await this.repository.delete(user.getId());
  }

  async remove(userId: number): Promise<boolean> {
    const user = this.repository.getOne(userId);
    user.remove();
    return await this.repository.save(user);
  }
  async recover(userId: number): Promise<boolean> {
    const user = this.repository.getOne(userId);
    user.recover();
    await this.verifyStrategy.sendCode(userId, VerifyType.LOGIN);
    return await this.repository.save(user);
  }
  async changeLogin(userId: number, newLogin: string): Promise<void> {
    const user = this.repository.getOne(userId);
    user.setLogin(newLogin);
    await this.repository.save(user);
  }

  async getLoginDetails(id: number) {
    const user = this.repository.getOne(id);
    return {
      login: user.getLogin(),
      loginType: "MAIL",
    };
  }

  async verifyLogin(userId: number, code: string) {
    const isVerify = await this.verifyStrategy.checkCode(
      code,
      userId,
      VerifyType.LOGIN
    );
    if (!isVerify) return false;
    const user = this.repository.getOne(userId);
    user.checkLogin();
    return await this.repository.save(user);
  }
}
