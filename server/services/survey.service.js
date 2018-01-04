const Path = require('path-parser');
const { URL } = require('url');

module.exports = class SurveyService {

  async updateSurveys(data) {
    try {

      const uniqueServeys =
          data.map(this.buildSurveyDataFromBody)
              .filter(this.filterOutNullAndUndefined)
              .filter(this.filterByUniqueEmailAndSurveyId);

      for (let survey of uniqueServeys) {
        await Survey.updateOne(
            {
              _id: survey.surveyId,
              recipients: {
                $elemMatch: {email: survey.email, responded: false}
              }
            },
            {
              $inc: {[survey.choice]: 1},
              $set: {'recipients.$.responded': true},
              lastResponded: new Date()
            }
        ).exec();
      }

      return { success: true }
    } catch(error) {
      return error;
    }
  }

  getRecipientListFromEmailString(recipients) {
    return recipients.split(',').map(email => {
      return { email };
    })
  }


  buildSurveyDataFromBody(bodyItem) {
    const path = new Path('/api/surveys/:surveyId/:choice');
    const match = path.test(new URL(surveyData.url).pathname);
    if (match) {
      return { email: surveyData.email, surveyId: match.surveyId, choice: match.choice };
    }
  }

  filterOutNullAndUndefined(item) {
    return item !== null && item !== undefined;
  }

  filterByUniqueEmailAndSurveyId(survey, index, array) {
    const emailSurveyIdKeyArray = array.map(item => item.email + item.surveyId);

    return emailSurveyIdKeyArray.indexOf(survey.email + survey.id) === index;
  }
};
