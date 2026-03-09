import React, { useEffect, useRef } from 'react';
import { useStaticQuery, graphql } from 'gatsby';
import { CSSTransition, TransitionGroup } from 'react-transition-group';
import styled from 'styled-components';
import { srConfig } from '@config';
import sr from '@utils/sr';
import { Icon } from '@components/icons';
import { usePrefersReducedMotion } from '@hooks';

const StyledCertificationsSection = styled.section`
  display: flex;
  flex-direction: column;
  align-items: center;

  h2 {
    font-size: clamp(24px, 5vw, var(--fz-heading));
  }

  .certifications-grid {
    ${({ theme }) => theme.mixins.resetList};
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
    grid-gap: 15px;
    position: relative;
    margin-top: 50px;
    width: 100%;

    @media (max-width: 1080px) {
      grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
    }
  }
`;

const StyledCertification = styled.li`
  position: relative;
  cursor: default;
  transition: var(--transition);

  @media (prefers-reduced-motion: no-preference) {
    &:hover,
    &:focus-within {
      .cert-inner {
        transform: translateY(-7px);
      }
    }
  }

  a {
    position: relative;
    z-index: 1;
  }

  .cert-inner {
    ${({ theme }) => theme.mixins.boxShadow};
    ${({ theme }) => theme.mixins.flexBetween};
    flex-direction: column;
    align-items: flex-start;
    position: relative;
    height: 100%;
    padding: 2rem 1.75rem;
    border-radius: var(--border-radius);
    background-color: var(--light-navy);
    transition: var(--transition);
    overflow: auto;
  }

  .cert-top {
    ${({ theme }) => theme.mixins.flexBetween};
    margin-bottom: 35px;
    width: 100%;

    .folder {
      color: var(--green);
      svg {
        width: 40px;
        height: 40px;
      }
    }

    .cert-links {
      display: flex;
      align-items: center;
      margin-right: -10px;
      color: var(--light-slate);

      a {
        ${({ theme }) => theme.mixins.flexCenter};
        padding: 5px 7px;

        &.external {
          svg {
            width: 22px;
            height: 22px;
            margin-top: -4px;
          }
        }

        svg {
          width: 20px;
          height: 20px;
        }
      }
    }
  }

  .cert-title {
    margin: 0 0 10px;
    color: var(--lightest-slate);
    font-size: var(--fz-xxl);

    a {
      position: static;

      &:before {
        content: '';
        display: block;
        position: absolute;
        z-index: 0;
        width: 100%;
        height: 100%;
        top: 0;
        left: 0;
      }
    }
  }

  .cert-company {
    color: var(--green);
    font-family: var(--font-mono);
    font-size: var(--fz-xs);
    margin-bottom: 20px;
  }

  .cert-description {
    color: var(--light-slate);
    font-size: 17px;

    a {
      ${({ theme }) => theme.mixins.inlineLink};
    }
  }
`;

const Certifications = () => {
  const data = useStaticQuery(graphql`
    query {
      certifications: allMarkdownRemark(
        filter: { fileAbsolutePath: { regex: "/content/certifications/" } }
        sort: { fields: [frontmatter___date], order: DESC }
      ) {
        edges {
          node {
            frontmatter {
              title
              company
              url
              date(formatString: "MMMM YYYY")
            }
            html
          }
        }
      }
    }
  `);

  const revealTitle = useRef(null);
  const revealCerts = useRef([]);
  const prefersReducedMotion = usePrefersReducedMotion();

  useEffect(() => {
    if (prefersReducedMotion) {
      return;
    }

    sr.reveal(revealTitle.current, srConfig());
    revealCerts.current.forEach((ref, i) => sr.reveal(ref, srConfig(i * 100)));
  }, []);

  const certs = data.certifications.edges.filter(({ node }) => node);

  const certInner = node => {
    const { frontmatter, html } = node;
    const { url, title, company, date } = frontmatter;

    return (
      <div className="cert-inner">
        <header>
          <div className="cert-top">
            <div className="cert-links">
              <a
                href={url || '#'}
                aria-label="External Link"
                className="external"
                target="_blank"
                rel="noreferrer">
                <Icon name="External" />
              </a>
            </div>
          </div>

          <h3 className="cert-title">
            <a href={url ? url : '#'} target="_blank" rel="noreferrer">
              {title}
            </a>
          </h3>
          <div className="cert-company">
            {company} &bull; {date}
          </div>

          <div className="cert-description" dangerouslySetInnerHTML={{ __html: html }} />
        </header>
      </div>
    );
  };

  return (
    <StyledCertificationsSection id="certifications">
      <h2 ref={revealTitle}>Certifications</h2>

      <ul className="certifications-grid">
        {prefersReducedMotion ? (
          <>
            {certs &&
              certs.map(({ node }, i) => (
                <StyledCertification key={i}>{certInner(node)}</StyledCertification>
              ))}
          </>
        ) : (
          <TransitionGroup component={null}>
            {certs &&
              certs.map(({ node }, i) => (
                <CSSTransition key={i} classNames="fadeup" timeout={300} exit={false}>
                  <StyledCertification
                    key={i}
                    ref={el => (revealCerts.current[i] = el)}
                    style={{
                      transitionDelay: '0ms',
                    }}>
                    {certInner(node)}
                  </StyledCertification>
                </CSSTransition>
              ))}
          </TransitionGroup>
        )}
      </ul>
    </StyledCertificationsSection>
  );
};

export default Certifications;
