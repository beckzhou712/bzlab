---
title: Auctus
author: Beck Zhou
pubDatetime: 2026-08-13T10:00:00-04:00
description: "A read-through of Auctus: its purpose, architecture, and usage."
tags:
  - vida
---

![Fig. 1 from the paper: searching for datasets that mention "taxi" and contain records within the NYC area for the 2016-2021 period.](../../attachments/Screenshot%202026-08-14%20at%2015.01.20.png)

Auctus is an open-source dataset search engine designed to support data discovery and augmentation. It supports a rich set of discovery queries: beyond keyword search, users can specify **spatial and temporal queries** and **data integration queries** (that is, searching for datasets that can be unioned or joined with a query dataset), and they can pose complex queries that combine several constraints at once. From the user's side, Auctus offers an easy-to-use interface for exploring large dataset collections; it can materialize join and union results as CSV and D3M files; and it communicates through a REST API, which makes it possible to integrate with external interactive data analysis systems. It is developed, maintained, and open-sourced by the VIDA Center team.

GitHub: <https://github.com/VIDA-NYU/auctus_v2>
Paper: <https://arxiv.org/abs/2102.05716>

## The Auctus architecture

![Fig. 2 from the paper: an overview of Auctus' architecture, with data ingestion, profiling, and query and ranking layers sitting over the index and Lazo stores, all exposed through a Python/HTTP API and a web interface.](../../attachments/Screenshot%202026-08-14%20at%2015.03.34.png)

- **Data Ingestion:** Auctus retrieves datasets from repositories through their APIs, which lets it ingest data from many different sources (Socrata and Zenodo, for instance). Users can also upload their own datasets.
- **Profiling:** Once a dataset has been ingested, Auctus profiles it to obtain dataset metadata and to build the dataset summary used for presenting results. The profiler performs several tasks: column type detection (whether an attribute is categorical, numerical, spatial, or temporal); type-dependent statistics (frequency, mean, and variance for numerical attributes); and data summarization (see below). The profiler should be treated as pluggable; Auctus supports different profilers. For example, the work I am doing to integrate AutoDDG into Auctus uses the Atlas Profiler.
- **Storing Data and Data Summaries:** Auctus is a dataset discovery system, so it stores dataset summaries rather than the complete datasets. These summaries are what the indices are built from. At search time, Auctus uses them together with the `k`-means clustering algorithm to estimate the intersection size between two attributes, and from that decides whether a join is feasible. Auctus also stores provenance information, which is what allows the system to perform data augmentation and lets users download datasets. For efficiency, Auctus can additionally cache datasets.
- **Indices:** After the metadata — data summaries included — has been generated, it is indexed into an Elasticsearch server (Auctus v2 uses OpenSearch). Numerical and temporal summaries are indexed using the Range data type and spatial summaries using the Geo-shape data type, while categorical attributes are indexed with Lazo, a set-overlap search method based on MinHash sketches and locality-sensitive hashing (LSH).
- **Querying and Ranking:** Auctus supports queries that combine multiple constraints, including keyword, temporal, spatial, data type, and source. The system also supports data integration queries: given an input dataset `D_Q`, Auctus lets users search for datasets that can be unioned or joined with `D_Q`. This is handled by Join Search and Union Search. The former takes each attribute of `D_Q` and searches the index for that attribute's data type for attributes whose summaries intersect it; the latter searches the index for datasets containing attributes that share a data type with an attribute in `D_Q` and have a similar name (through a fuzzy query). The system then generates dataset profile information, which is used to probe the indices that support joins and unions. Finally, the lists of matching datasets from the different indices are merged, ranked by the Levenshtein similarity between the matched attribute names, and returned as the search results.
- **Augmentation:** Auctus can carry out the augmentation itself. The user picks a dataset `R ∈ D`, and Auctus materializes it (using the provenance information recorded in the metadata), performs the join or union with `D`, and returns the new augmented dataset `A`.

## The user interface

Auctus' interface is an easy-to-use, visually driven one, supporting data discovery queries, data type filters, data integration queries, result presentation and exploration, augmentation, and uploading data and curating metadata.

![Fig. 3 from the paper: components of Auctus' user interface — the keyword and filter-based search box (A), search results (B), dataset snippets (B1), dataset summary (B2), dataset upload (C), and dataset collection statistics (D).](../../attachments/Screenshot%202026-08-14%20at%2015.28.55.png)

## Extensibility and the API

The search engine is fully containerized with Docker. Each data discovery plugin is its own container, which allows several plugins to run in parallel. Auctus can also start as many profiling and query containers as the load calls for. The system can be reached either through the web UI or programmatically, through Python and a REST API.
