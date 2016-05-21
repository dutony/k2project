// ==UserScript==
// @name        testK2
// @namespace   K2 testing
// @include     https://aws-support-internal-tools.s3.amazonaws.com/
// @include     https://aws-support-dashboard.amazon.com/
// @include     http://aws-support-dashboard.amazon.com/
// @include     http://127.0.0.1*/index.html*
// @version     1
// @grant       GM_xmlhttpRequest
// @require     https://sdk.amazonaws.com/js/aws-sdk-2.3.14.min.js
// @require     https://code.jquery.com/jquery-2.2.3.min.js
// @run-at      document-end
// @unwrap
// ==/UserScript==

this.$ = this.jQuery = jQuery.noConflict(true);
    
(function () {  
  
  var a = new Date();
  var timeStamp = a.getTime().toString();
  var generatedCfnTemplate = {
  };
  // queryK2('beanstalk.describeEnvironments', 'us-west-2', '362218778955', ebArgs);
    
  $('#displayBtn').click(function () {
    
    var accountID = $('#accountID').val();
    var environmentName = $('#envName').val();
    var region = $('input[name=\'regionRadio\']:checked').val();
    // var region = "us-west-2";
    if ((accountID) && (environmentName) && (region)) {
      var ebArgs = {
        // environmentIds: ['e-vxze5dzvjw'],
        environmentNames: [
          // "singleInstance-blahblah"
          environmentName
        ]
      };
      queryK2('beanstalk.describeEnvironments', region, accountID, ebArgs, displayTemplate);
      invokeLambdaUploadToS3(generatedCfnTemplate);
    } else {
      alert('Enter correct details');
    }
    
  });
  
  $('#downloadBtn').click(function () {
    var accountID = $('#accountID').val();
    var environmentName = $('#envName').val();
    var region = $('input[name=\'regionRadio\']:checked').val();
    // var region = "us-west-2";
    if ((accountID) && (environmentName) && (region)) {
      var ebArgs = {
        // environmentIds: ['e-vxze5dzvjw'],
        environmentNames: [
          // "singleInstance-blahblah"
          environmentName
        ]
      };
      queryK2('beanstalk.describeEnvironments', region, accountID, ebArgs, downloadTemplate);
    } else {
      alert('Enter correct details');
    }
  });
  
  $('#oneClickBtn').click(function () {
    
    var accountID = $('#accountID').val();
    var environmentName = $('#envName').val();
    var region = $('input[name=\'regionRadio\']:checked').val();

    if ((accountID) && (environmentName) && (region)) {
      var ebArgs = {
        // environmentIds: ['e-vxze5dzvjw'],
        environmentNames: [
          // "singleInstance-blahblah"
          environmentName
        ]
      };
      queryK2('beanstalk.describeEnvironments', region, accountID, ebArgs, oneClickLaunchTemplate);
    } else {
      alert('Enter correct details');
    }
  });
  
  function queryK2(apiName, region, accountId, args, callback) {
    var data = {
    };
    if ((region) && (accountId) && (args)) {
      data['region'] = region;
      data['accountId'] = accountId;
      data['args'] = args;
      data['apiName'] = apiName;
    }
    GM_xmlhttpRequest({
      method: 'POST',
      url: 'https://k2.amazon.com/workbench/aws/resources/',
      headers: {
        'Accept': 'application/json'
      },
      data: JSON.stringify(data),
      onload: function (response) {
        if (response.readyState === 4) {
          // returns response if status is OK
          callback(response, region, args);
        }
      }
    });
  };
  
  function displayTemplate(xmlhttpResponse) {
    // console.log(JSON.stringify(JSON.parse(xmlhttpResponse.responseText), undefined, 7));
    generatingCfnTemplate(JSON.parse(xmlhttpResponse.responseText));
    unsafeWindow.custJson = JSON.stringify(generatedCfnTemplate, undefined, 7);
    var data = '<pre>' + unsafeWindow.custJson + '</pre>';
    myWindow = window.open('data:text/html,' + encodeURIComponent(data), '_blank');
    myWindow.focus();
  };
  
  function downloadTemplate(xmlhttpResponse) {
    generatingCfnTemplate(JSON.parse(xmlhttpResponse.responseText));
    var cfTemplate = JSON.stringify(generatedCfnTemplate, undefined, 7);
    generateDownloadFile('Reproduction' + timeStamp + '.json', cfTemplate);
    url = 'https://console.aws.amazon.com/cloudformation/home?region=us-west-2#/stacks/new';
    myWindow = window.open(url, '_blank');
    myWindow.focus();
  };  
  
  function oneClickLaunchTemplate(xmlhttpResponse, region, args) {
    generatingCfnTemplate(JSON.parse(xmlhttpResponse.responseText));
    unsafeWindow.custJson = JSON.stringify(generatedCfnTemplate, undefined, 7);
    invokeLambdaUploadToS3(unsafeWindow.custJson, region, args);
  };
  
  var lambda = new AWS.Lambda({ 
      region: 'us-west-2',
      accessKeyId: 'AKIAJIRJRWECLOMK57HA',
      secretAccessKey: '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'
  });
  
  function invokeLambdaUploadToS3(cfnTemplate, region, args) {
    
    var payloadJson = {
        "region": "ap-southeast-2",
        "body": cfnTemplate,
        "objectKey": args.environmentNames[0] + timeStamp +'.json'
    }
    
    var params = {
      FunctionName: 'uploadToS3', /* required */
      Payload: JSON.stringify(payloadJson)
    };

    lambda.invoke(params, function(err, data) {
      if (err) {
        console.log(err, err.stack);   // an error occurred
      } else {
          console.log(data);           // successful response
          var url = 'https://console.aws.amazon.com/cloudformation/home?region=' + region + '#/stacks/new?templateURL=https:%2F%2Fs3-ap-southeast-2.amazonaws.com%2Fdeployment-k2%2F' + payloadJson.objectKey;
          myWindow = window.open(url, '_blank');
          myWindow.focus();
      }     
    });
    
  };
  
  function generateDownloadFile(filename, text) {
    var pom = document.createElement('a');
    pom.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(text));
    pom.setAttribute('download', filename);
    if (document.createEvent) {
      var event = document.createEvent('MouseEvents');
      event.initEvent('click', true, true);
      pom.dispatchEvent(event);
    } 
    else {
      pom.click();
    }
  };
  
  function generatingCfnTemplate(customerEnvironmentJson) {
    generatedCfnTemplate = {
      'Parameters': {
        'MyKeyName': {
          'Description': 'Amazon EC2 Key Pair',
          'Type': 'AWS::EC2::KeyPair::KeyName'
        }
      },
      'Resources': {
        'BeanstalkEnvironmentReplica': {
          'Type': 'AWS::ElasticBeanstalk::Environment',
          'Properties': {
            'ApplicationName': {
              'Ref': 'BeanstalkApplicationReplica'
            },
            'Description': 'Elastic Beanstalk Case Reproduction Environment',
            'EnvironmentName': 'ENV' + timeStamp,
            'OptionSettings': [
              {
                'Namespace': 'aws:autoscaling:launchconfiguration',
                'OptionName': 'EC2KeyName',
                'Value': {
                  'Ref': 'MyKeyName'
                }
              }
            ],
            'SolutionStackName': customerEnvironmentJson.environments[0].solutionStackName,
            'Tier': {
              'Name': customerEnvironmentJson.environments[0].tier.name,
              'Type': customerEnvironmentJson.environments[0].tier.type
            }
          }
        },
        'BeanstalkApplicationReplica': {
          'Type': 'AWS::ElasticBeanstalk::Application',
          'Properties': {
            'ApplicationName': 'Aplication' + timeStamp,
            'Description': 'Elastic Beanstalk Case reproduction ApplicationName'
          }
        }
      },
    };
  };
}) ();
