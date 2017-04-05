'use strict';
const Generator = require('yeoman-generator');
const stringUtils = require('./lib/stringUtils');
// Const chalk = require('chalk');
// const yosay = require('yosay');

module.exports = class extends Generator {

  /**
   * Prompting section asks for user input that is required for the
   * generation step.
   */
  prompting() {
    this.log('Welcome to the Xtext Yeoman generator.');

    const prompts = [
      // TODO function for default values when project name is changed
      // TODO validation
      {
        type: 'input',
        name: 'projectName',
        message: 'Project name:',
        default: 'org.xtext.example.mydsl'
      },
      {
        type: 'input',
        name: 'fqLanguageName', // Fully qualified language name
        message: 'Language name:',
        default: function (answers) {
          return `${answers.projectName}.MyDsl`;
        }
      },
      {
        type: 'input',
        name: 'fileExtension',
        message: 'File extension:',
        default: function (answers) {
          return answers.fqLanguageName.split('.').pop().toLowerCase();
        }
      }
    ];

    return this.prompt(prompts).then(props => {
      // To access props later use this.props.someAnswer;
      this.props = props;
    });
  }

  /**
   * This is the actual generation task. To keep it simple the individual
   * steps were extracted into separate methods.
   */
  writing() {
    this._setupGradleBuild();
    this._createXtextProject();
  }

  /**
   * Creates the main Gradle build without knowledge of the subprojects.
   */
  _setupGradleBuild() {
    // Copying static files
    this.fs.copy(
      this.templatePath('gradle/'),
      this.destinationPath('gradle/')
    );
    this.fs.copy(
      this.templatePath('gradlew'),
      this.destinationPath('gradlew')
    );
    this.fs.copy(
      this.templatePath('gradlew.bat'),
      this.destinationPath('gradlew.bat')
    );

    // Copying templates
    this.fs.copyTpl(
      this.templatePath('build.gradle'),
      this.destinationPath('build.gradle'),
      {projectName: this.props.projectName}
    );
  }

  /**
   * Creates the core Xtext project.
   */
  _createXtextProject() {
    // Split the fully qualified language name into its root package and the actual name
    let languageNameSplit = this.props.fqLanguageName.split('.');
    let languageName = stringUtils.toFirstUpper(languageNameSplit.pop());
    let rootPackage = languageNameSplit.join('.');
    let javaSourceRoot = `src/main/java/${rootPackage.split('.').join('/')}`;

    // Generate MWE2 file
    let workflowFile = `${javaSourceRoot}/Generate${languageName}.mwe2`;
    this.fs.copyTpl(
      this.templatePath('org.xtext.example.mydsl/src/main/java/GenerateMyDsl.mwe2'),
      this.destinationPath(`${this.props.projectName}/${workflowFile}`),
      {
        projectName: this.props.projectName,
        rootPackage: rootPackage,
        languageName: languageName,
        fileExtension: this.props.fileExtension
      }
    );

    // Generate Xtext grammar
    let grammarFile = `${javaSourceRoot}/${languageName}.xtext`;
    this.fs.copyTpl(
      this.templatePath('org.xtext.example.mydsl/src/main/java/MyDsl.xtext'),
      this.destinationPath(`${this.props.projectName}/${grammarFile}`),
      {
        rootPackage: rootPackage,
        languageName: languageName,
        ePackageName: stringUtils.toFirstLower(languageName),
        ePackageNs: stringUtils.toURL(this.props.fqLanguageName)
      }
    );

    // Setup Gradle build
    this.fs.copyTpl(
      this.templatePath('org.xtext.example.mydsl/build.gradle'),
      this.destinationPath(`${this.props.projectName}/build.gradle`),
      {
        workflowFile: workflowFile,
        grammarFile: grammarFile
      }
    );
    this.fs.write(
      this.destinationPath('settings.gradle'),
      `include "${this.props.projectName}"\n`
    );
  }

  /**
   * Run the Gradle build to generate the remaining files using the MWE2 workflow.
   */
  install() {
    this.spawnCommand('./gradlew', ['build']);
  }

};
