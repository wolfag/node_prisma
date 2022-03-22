import Hapi from "@hapi/hapi";
import Boom from "@hapi/boom";

export async function isTeacherOfCourseOrAdmin(
  request: Hapi.Request,
  h: Hapi.ResponseToolkit
) {
  const { isAdmin, teacherOf } = request.auth.credentials;

  if (isAdmin) {
    return h.continue;
  }

  const courseId = parseInt(request.params.courseId, 10);

  if (teacherOf?.includes(courseId)) {
    return h.continue;
  }

  throw Boom.forbidden();
}
