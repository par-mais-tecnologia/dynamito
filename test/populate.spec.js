import Dynamito from '../lib';

import PersonSchema from './mocks/person.model.mock.js';
import * as AuthorStory from './mocks/authorstory.mock';

var PersonModel;
var StoryModel;

describe('Dynamito Query Populate: ', () => {
  before(() => {
    PersonModel = Dynamito.model('Person', PersonSchema);
    StoryModel = Dynamito.model('Story', AuthorStory.storySchema);
  });
  before(() => {
    return PersonModel.scan().removeAll()
      ;});
  before(() => {
    return StoryModel.scan().removeAll();
  });

  before(() => {
    return PersonModel
      .create([{
        email: 'jon.snow@winterfell.com',
        name: 'Jonn',
        last: 'Snow',
        password: '1234',
        age: 22,
        ocupation: 'Night Watch'
      }, {
        email: 'arya.stark@winterfell.com',
        name: 'Arya',
        last: 'Stark',
        password: '1234',
        age: 22,
        ocupation: 'Faceless Soldier'
      }, {
        email: 'sansa.stark@winterfell.com',
        name: 'Sansa',
        last: 'Stark',
        password: '1234',
        age: 22,
        ocupation: 'Bard'
      }])
      .then(item => {
        return StoryModel
          .create({
            creator: item[0].email,
            title: 'Night Watch Tales',
            fans: [
              item[1].email,
              item[2].email
            ]
          });
      });
  });

  describe('linking entities', () => {
    it('should accept a single object as reference', () => {
      return StoryModel
        .findById('Night Watch Tales')
        .populate('creator')
        .exec()
        .then(it => {
          expect(it.creator.name).to.be.equal('Jonn');
        });
    });

    it('should accept a list of object as reference', () => {
      return StoryModel
        .findById('Night Watch Tales')
        .populate('creator')
        .populate('fans')
        .exec()
        .then(it => {
          expect(it.creator.name).to.be.equal('Jonn');
          expect(it.fans[0].name).to.be.equal('Arya');
          expect(it.fans[1].name).to.be.equal('Sansa');
        });
    });
  });

  describe('errors', () => {
    it('should not populate scan operation', () => {
      return StoryModel
        .scan()
        .populate('creator')
        .exec()
        .should.be.rejectedWith('Canot populate scan operation.');
    });
  });
});
