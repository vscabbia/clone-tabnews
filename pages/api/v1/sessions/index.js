import { createRouter } from "next-connect";
import controller from "infra/controller";
import user from "models/user.js";
import password from "models/password";
import { UnauthorizedError } from "infra/errors.js";

const router = createRouter();

router.post(postHandler);

export default router.handler(controller.errorHandlers);

async function postHandler(request, response) {
  const userInputValues = request.body;

  try {
    const storedUser = await user.findOneByEmail(userInputValues.email);
    const correctPasswordMatch = await password.compare(
      userInputValues.password,
      storedUser.password,
    );

    if (!correctPasswordMatch) {
      throw new UnauthorizedError({
        message: "Senha incorreta.",
        action: "Verifique se este dado está correto.",
      });
    }
  } catch (error) {
    throw new UnauthorizedError({
      message: "Dados de autenticação inválidos.",
      action: "Verifique se os dados informados estão corretos.",
    });
  }

  return response.status(201).json({});
}
