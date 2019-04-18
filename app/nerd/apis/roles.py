from flask.views import MethodView
from flask_rest_api import Blueprint
from marshmallow import fields

from nerd.apis import BaseSchema, jwt_and_role_required
from nerd.core.document.user import Role

blp = Blueprint('roles', 'roles', description='Roles')


class RoleListSchema(BaseSchema):
    roles = fields.List(fields.String())


@blp.route('/')
class RoleListView(MethodView):

    @jwt_and_role_required(Role.ADMIN)
    @blp.response(RoleListSchema)
    @blp.doc(operationId="listRoles")
    def get(self):
        """Returns a list of available roles"""
        return {'roles': [role.value for role in Role]}
