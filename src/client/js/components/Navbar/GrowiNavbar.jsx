import React from 'react';
import PropTypes from 'prop-types';

import { withTranslation } from 'react-i18next';

import { withUnstatedContainers } from '../UnstatedUtils';
import NavigationContainer from '../../services/NavigationContainer';
import AppContainer from '../../services/AppContainer';

class GrowiNavbar extends React.Component {

  render() {
    const { appContainer } = this.props;
    const appTitle = appContainer.config.crowi.title;

    return (
      <nav className="navbar grw-navbar navbar-expand navbar-dark sticky-top mb-0 px-0">

        {/* Brand Logo  */}
        <div className="navbar-brand mr-0">
          <a className="grw-logo d-block" href="/">
            {/* eslint-disable max-len  */}
            <svg xmlns="http://www.w3.org/2000/svg" width="32px" height="32px" viewBox="0 0 226.44 196.11">
              <polygon className="group2" points="56.61 196.11 169.83 196.11 226.44 98.06 188.7 98.06 150.96 163.43 75.48 163.43 56.61 196.11" />
              <polygon className="group1" points="75.48 98.05 94.35 65.37 150.96 65.38 207.57 65.37 207.57 65.38 226.44 98.06 169.83 98.06 113.22 98.06 94.39 130.66 94.3 130.66 84.92 114.4 75.48 98.05" />
              <polygon className="group1" points="0 98.06 56.6 0 113.22 0.01 169.83 0.01 169.83 0.01 188.69 32.68 132.09 32.69 75.47 32.69 18.86 130.74 0 98.06" />
              <polygon className="group1" points="75.48 163.43 56.61 130.74 37.71 163.46 47.15 179.81 56.54 196.07 56.63 196.07 75.48 163.43" />
            </svg>
            {/* eslint-enable max-len  */}
          </a>
        </div>

        <ul className="navbar-nav d-md-none">
          <li id="grw-navbar-toggler" className="nav-item"></li>
        </ul>
        <div className="grw-app-title d-none d-md-block">
          {appTitle}
        </div>
        {/*

    {# Navbar Right #}
    <ul class="navbar-nav ml-auto">
      {% if user %}
        <li id="create-page-button" class="nav-item d-none d-md-block"></li>
        {% if isSearchServiceConfigured() %}
          <li class="nav-item d-md-none">
            <a type="button" class="nav-link px-4" data-target="#grw-search-top-collapse" data-toggle="collapse">
              <i class="icon-magnifier mr-2"></i>
            </a>
          </li>
        {% endif %}
        <li id="personal-dropdown" class="grw-personal-dropdown nav-item dropdown dropdown-toggle dropdown-toggle-no-caret"></li>
      {% else %}
        <li id="login-user" class="nav-item"><a class="nav-link" href="/login">Login</a></li>
      {% endif %}

      {% if getConfig('crowi', 'app:confidential') %}
        <li class="nav-item confidential text-light">
          <i class="icon-info d-md-none" data-toggle="tooltip" title="{{ getConfig('crowi', 'app:confidential') }}"></i>
          <span class="d-none d-md-inline">
            {{ getConfig('crowi', 'app:confidential') }}
          </span>
        </li>
      {% endif %}
    </ul> */}

      </nav>
    );
  }

}

/**
 * Wrapper component for using unstated
 */
const GrowiNavbarWrapper = withUnstatedContainers(GrowiNavbar, [AppContainer, NavigationContainer]);


GrowiNavbar.propTypes = {
  t: PropTypes.func.isRequired, //  i18next

  appContainer: PropTypes.instanceOf(AppContainer).isRequired,
  navigationContainer: PropTypes.instanceOf(NavigationContainer).isRequired,
};

export default withTranslation()(GrowiNavbarWrapper);
