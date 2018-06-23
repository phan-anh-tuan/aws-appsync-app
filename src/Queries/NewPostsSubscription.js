import gql from 'graphql-tag';

export default gql`
    subscription NewPostSub {
      onCreatePost {
          __typename
          id
          title
          author
          version
      }
}`;