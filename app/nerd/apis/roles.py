from flask.views import MethodView
from flask_smorest import Blueprint
from marshmallow import fields

from nerd.apis import BaseSchema, jwt_and_role_required
from nerd.core.document.user import Role

blp = Blueprint('roles', 'roles', description='Roles')


class RoleListSchema(BaseSchema):
    roles = fields.List(fields.String(required=True))


@blp.route('/')
class RoleListView(MethodView):

    @jwt_and_role_required(Role.ADMIN)
    @blp.response(RoleListSchema, code=200, description='List of roles')
    @blp.doc(operationId="listRoles")
    def get(self):
        """Returns a list of available roles"""
        return {'roles': [role.value for role in Role]}
