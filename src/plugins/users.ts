import Hapi from "@hapi/hapi";
import Joi from "@hapi/joi";

const usersPlugin: Hapi.Plugin<null> = {
  name: "app/users",
  dependencies: ["prisma"],
  register: async (server: Hapi.Server) => {
    server.route([
      {
        method: "GET",
        path: "/users/{userId}",
        handler: getUserHandler,
        options: {
          validate: {
            params: Joi.object({ userId: Joi.number().integer() }),
            failAction: (request, h, err) => {
              throw err;
            },
          },
        },
      },
      {
        method: "POST",
        path: "/users",
        handler: registerHandler,
        options: {
          validate: {
            payload: createUserValidator,
            failAction: (request, h, err) => {
              throw err;
            },
          },
        },
      },
      {
        method: "DELETE",
        path: "/users/{userId}",
        handler: deleteHandler,
        options: {
          validate: {
            params: Joi.object({ userId: Joi.number().integer() }),
            failAction: (request, h, err) => {
              throw err;
            },
          },
        },
      },
      {
        method: "PUT",
        path: "/users/{userId}",
        handler: updateHandler,
        options: {
          validate: {
            params: Joi.object({ userId: Joi.number().integer() }),
            payload: updateUserValidator,
            failAction: (request, h, err) => {
              throw err;
            },
          },
        },
      },
    ]);
  },
};

export default usersPlugin;

const userInputValidator = Joi.object({
  firstName: Joi.string().alter({
    create: (schema) => schema.required(),
    update: (schema) => schema.optional(),
  }),
  lastName: Joi.string().alter({
    create: (schema) => schema.required(),
    update: (schema) => schema.optional(),
  }),
  email: Joi.string()
    .email()
    .alter({
      create: (schema) => schema.required(),
      update: (schema) => schema.optional(),
    }),
  social: Joi.object({
    facebook: Joi.string().optional(),
    twitter: Joi.string().optional(),
    github: Joi.string().optional(),
    website: Joi.string().optional(),
  }).optional(),
});

const createUserValidator = userInputValidator.tailor("create");
const updateUserValidator = userInputValidator.tailor("update");

interface UserInput {
  firstName: string;
  lastName: string;
  email: string;
  social: {
    facebook?: string;
    twitter?: string;
    github?: string;
    website?: string;
  };
}

async function getUserHandler(request: Hapi.Request, h: Hapi.ResponseToolkit) {
  const { prisma } = request.server.app;
  const userId = parseInt(request.params.userId, 0);

  try {
    const user = await prisma.user.findUnique({
      where: {
        id: userId,
      },
    });
    if (!user) {
      return h.response().code(404);
    } else {
      return h.response(user).code(200);
    }
  } catch (error) {
    console.log({ error });
    return h.response().code(500);
  }
}

async function registerHandler(request: Hapi.Request, h: Hapi.ResponseToolkit) {
  const { prisma } = request.server.app;
  const payload = request.payload as UserInput;

  try {
    const createdUser = await prisma.user.create({
      data: payload,
      select: {
        id: true,
      },
    });
    return h.response(createdUser).code(200);
  } catch (error) {
    console.log({ error });
  }
}

async function deleteHandler(request: Hapi.Request, h: Hapi.ResponseToolkit) {
  const { prisma } = request.server.app;
  const userId = parseInt(request.params.userId, 10);

  try {
    await prisma.user.delete({
      where: {
        id: userId,
      },
    });
    return h.response().code(204);
  } catch (error) {
    console.log({ error });
    return h.response().code(500);
  }
}

async function updateHandler(request: Hapi.Request, h: Hapi.ResponseToolkit) {
  const { prisma } = request.server.app;
  const userId = parseInt(request.params.userId, 10);
  const payload = request.payload as Partial<UserInput>;

  try {
    const updatedUser = await prisma.user.update({
      where: {
        id: userId,
      },
      data: payload,
    });

    return h.response(updatedUser).code(200);
  } catch (error) {
    console.log({ error });
    return h.response().code(500);
  }
}
