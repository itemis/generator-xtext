'use strict';
const Generator = require('yeoman-generator');
const stringUtils = require('./lib/stringUtils');

module.exports = class extends Generator {

  /**
   * Prompting section asks for user input that is required for the
   * generation step.
   */
  prompting() {
    this.log('Welcome to the Xtext Yeoman generator.');

    const prompts = [
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
        default: answers => {
          return `${answers.projectName}.MyDsl`;
        }
      },
      {
        type: 'input',
        name: 'fileExtension',
        message: 'File extension:',
        default: answers => {
          return answers.fqLanguageName.split('.').pop().toLowerCase();
        }
      },
      {
        type: 'checkbox',
        name: 'facets',
        message: 'Select the facets you would like to use:',
        choices: [
          {
            name: 'testing',
            checked: true
          },
          {
            name: 'ide',
            checked: true
          },
          {
            name: 'web'
          }
        ],
        validate: answers => {
          let webWithoutIde = answers.includes('web') && !answers.includes('ide');
          if (webWithoutIde) {
            return '\'ide\' is required when using \'web\'.';
          }
          return true;
        }
      },
      {
        type: 'list',
        name: 'webFramework',
        message: 'Select your web framework:',
        choices: [
          {name: 'Orion'},
          {name: 'Ace'},
          {name: 'CodeMirror'}
        ],
        when: answers => {
          return answers.facets.includes('web');
        }
      }
    ];

    return this.prompt(prompts).then(props => {
      // To access props later use this.props.someAnswer;
      this.props = props;

      // Simplify access by precalculating values
      this.testingEnabled = props.facets.includes('testing');
      this.ideEnabled = props.facets.includes('ide');
      this.webEnabled = props.facets.includes('web');

      // Split the fully qualified language name into its root package and the actual name
      let languageNameSplit = this.props.fqLanguageName.split('.');
      this.languageName = stringUtils.toFirstUpper(languageNameSplit.pop());
      this.rootPackage = languageNameSplit.join('.');
      this.javaSourceRoot = `src/main/java/${this.rootPackage.split('.').join('/')}`;
    });
  }

  /**
   * This is the actual generation task. To keep it simple the individual
   * steps were extracted into separate methods.
   */
  writing() {
    this._setupGradleBuild();
    this._createCoreProject();
    if (this.ideEnabled) {
      this._createIdeProject();
    }
    if (this.webEnabled) {
      this._createWebProject();
    }
  }

  /**
   * Creates the main Gradle build without knowledge of the subprojects.
   */
  _setupGradleBuild() {
    // Copying static files
    this.fs.copy(
      this.templatePath('.gitignore'),
      this.destinationPath('.gitignore')
    );
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
  _createCoreProject() {
    // Generate MWE2 file
    let workflowFile = `${this.javaSourceRoot}/Generate${this.languageName}.mwe2`;
    this.fs.copyTpl(
      this.templatePath('org.xtext.example.mydsl/src/main/java/GenerateMyDsl.mwe2'),
      this.destinationPath(`${this.props.projectName}/${workflowFile}`),
      {
        projectName: this.props.projectName,
        rootPackage: this.rootPackage,
        languageName: this.languageName,
        fileExtension: this.props.fileExtension,
        testingEnabled: this.testingEnabled,
        webEnabled: this.webEnabled,
        webFramework: this.props.webFramework
      }
    );

    // Generate Xtext grammar
    let grammarFile = `${this.javaSourceRoot}/${this.languageName}.xtext`;
    this.fs.copyTpl(
      this.templatePath('org.xtext.example.mydsl/src/main/java/MyDsl.xtext'),
      this.destinationPath(`${this.props.projectName}/${grammarFile}`),
      {
        rootPackage: this.rootPackage,
        languageName: this.languageName,
        ePackageName: stringUtils.toFirstLower(this.languageName),
        ePackageNs: stringUtils.toURL(this.props.fqLanguageName)
      }
    );

    // Setup Gradle build
    this.fs.copyTpl(
      this.templatePath('org.xtext.example.mydsl/build.gradle'),
      this.destinationPath(`${this.props.projectName}/build.gradle`),
      {
        workflowFile: workflowFile,
        grammarFile: grammarFile,
        testingEnabled: this.testingEnabled
      }
    );
    this.fs.write(
      this.destinationPath('settings.gradle'),
      `include "${this.props.projectName}"`
    );
  }

  /**
   * Creates the generic IDE project.
   */
  _createIdeProject() {
    // Setup Gradle build
    this.fs.copyTpl(
      this.templatePath('org.xtext.example.mydsl.ide/build.gradle'),
      this.destinationPath(`${this.props.projectName}.ide/build.gradle`),
      {projectName: this.props.projectName}
    );
    this.fs.append(
      this.destinationPath('settings.gradle'),
      `include "${this.props.projectName}.ide"`,
      {separator: '\n'}
    );
  }

  /**
   * Creates the web project.
   */
  _createWebProject() {
    // Setup Gradle build
    this.fs.copyTpl(
      this.templatePath('org.xtext.example.mydsl.web/build.gradle'),
      this.destinationPath(`${this.props.projectName}.web/build.gradle`),
      {
        projectName: this.props.projectName,
        rootPackage: this.rootPackage,
        webFramework: this.props.webFramework
      }
    );
    this.fs.append(
      this.destinationPath('settings.gradle'),
      `include "${this.props.projectName}.web"`,
      {separator: '\n'}
    );
  }

  /**
   * Run the Gradle build to generate the remaining files using the MWE2 workflow.
   */
  install() {
    this.spawnCommand('./gradlew', ['build']);
  }

};
