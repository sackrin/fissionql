import { expect } from 'chai';
import getPerson from '../__fakes__/getPerson';
import getProfileData from '../__fakes__/getProfileFields';
import { graphql, GraphQLObjectType, GraphQLSchema } from 'graphql';
import getTypes from '../getTypes';
import { RoleType, ScopeType } from 'schemaly';

const getSchema = async ({ roles, scope }: { roles: RoleType[]; scope: ScopeType[] }) => {
  const models = [getPerson(getProfileData())];
  const queries: any = await getTypes({
    models,
    roles,
    scope,
    options: {}
  });
  return new GraphQLSchema({
    query: new GraphQLObjectType({
      name: 'Query',
      fields: queries
    })
  });
};

describe('getTypes', () => {
  it('can resolve valid data with all permissions', async () => {
    const fakeQuery = `
      query Query {
        person {
          _id
          firstName
          surname
          company {
            name
            abn
          }
          phone {
            number
            extension
          }
          address {
            ... on office {
              pobox
              suburb
              country
            }
            ... on physical {
              street
              suburb
              country
            }
          }
        }
      }
    `;
    const fakeResult = await graphql({
      schema: await getSchema({
        roles: ['owner'],
        scope: ['r', 'w']
      }),
      source: fakeQuery
    });
    expect(fakeResult).to.deep.equal({ data: { person: getProfileData() } });
  });

  it('can resolve protected data with permissions', async () => {
    const fakeQuery = `
      query Query {
        person {
          _id
          firstName
          surname
        }
      }
    `;
    const fakeData = getProfileData();
    const fakeResult = await graphql({
      schema: await getSchema({
        roles: ['guest'],
        scope: ['r', 'w']
      }),
      source: fakeQuery
    });
    expect(fakeResult).to.deep.equal({
      data: {
        person: {
          _id: fakeData._id,
          firstName: fakeData.firstName,
          surname: fakeData.surname
        }
      }
    });
  });
});
